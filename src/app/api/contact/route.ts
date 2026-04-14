import { config } from '@/lib/config'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const ContactPayload = z.object({
	name: z.string().trim().max(100).optional().default(''),
	email: z.string().trim().email().max(254),
	message: z.string().trim().min(10).max(5000),
	// Honeypot — real humans leave this empty. Bots fill it.
	website: z.string().max(0).optional().default(''),
})

const RATE_LIMIT_WINDOW_MS = 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 3

// In-memory rate limit. Fly machines scale-to-zero when idle and the idle
// window is longer than RATE_LIMIT_WINDOW_MS, so state loss on cold start is
// acceptable for a personal-site contact form.
const hitsByIp = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
	const now = Date.now()
	const windowStart = now - RATE_LIMIT_WINDOW_MS
	const recent = (hitsByIp.get(ip) ?? []).filter(ts => ts > windowStart)
	if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
		hitsByIp.set(ip, recent)
		return true
	}
	recent.push(now)
	hitsByIp.set(ip, recent)
	return false
}

function getClientIp(request: Request): string {
	const forwardedFor = request.headers.get('x-forwarded-for')
	if (forwardedFor) return forwardedFor.split(',')[0].trim()
	const realIp = request.headers.get('x-real-ip')
	if (realIp) return realIp.trim()
	return 'unknown'
}

export async function POST(request: Request) {
	if (!config.contactRelayUrl || !config.contactRelayToken) {
		console.error('Contact relay not configured')
		return NextResponse.json(
			{ error: 'Contact form is temporarily unavailable.' },
			{ status: 503 },
		)
	}

	let body: unknown
	try {
		body = await request.json()
	} catch {
		return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
	}

	const parsed = ContactPayload.safeParse(body)
	if (!parsed.success) {
		return NextResponse.json(
			{ error: 'Please check your entries and try again.' },
			{ status: 400 },
		)
	}

	// Silently drop honeypot hits — return success so the bot moves on.
	if (parsed.data.website && parsed.data.website.length > 0) {
		return NextResponse.json({ success: true })
	}

	const ip = getClientIp(request)
	if (rateLimited(ip)) {
		return NextResponse.json(
			{ error: 'Too many messages. Please wait a moment and try again.' },
			{ status: 429 },
		)
	}

	try {
		const relayResponse = await fetch(config.contactRelayUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${config.contactRelayToken}`,
			},
			body: JSON.stringify({
				name: parsed.data.name || undefined,
				email: parsed.data.email,
				message: parsed.data.message,
				source: 'beverage.me',
			}),
		})

		if (!relayResponse.ok) {
			const relayBody = await relayResponse.text()
			console.error('Contact relay error:', relayResponse.status, relayBody)
			return NextResponse.json(
				{ error: 'Something went wrong. Please try again.' },
				{ status: 502 },
			)
		}

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Contact relay fetch failed:', error)
		return NextResponse.json(
			{ error: 'Something went wrong. Please try again.' },
			{ status: 502 },
		)
	}
}
