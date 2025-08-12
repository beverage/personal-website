import { z } from 'zod'

// Simple config schema - just the URLs
const ConfigSchema = z.object({
	githubUrl: z.string().url().optional(),
	linkedinUrl: z.string().url().optional(),
	instagramUrl: z.string().url().optional(),
	emailAddress: z.string().email().optional(),
	// Allow absolute URLs (https://...) OR same-origin paths like /cv/file.pdf
	cvUrl: z
		.union([
			z.string().url(),
			z.string().regex(/^\//, {
				message: 'Must be an absolute URL or start with / for same-origin path',
			}),
		])
		.optional(),
})

export type Config = z.infer<typeof ConfigSchema>

// Parse environment variables (server-side, can read any env vars)
function parseConfig(): Config {
	const rawConfig = {
		// Read your existing deployment variables (no NEXT_PUBLIC_ needed server-side)
		githubUrl: process.env.GITHUB_PROFILE_URL,
		linkedinUrl: process.env.LINKEDIN_PROFILE_URL,
		instagramUrl: process.env.INSTAGRAM_PROFILE_URL,
		emailAddress: process.env.CONTACT_EMAIL_ADDRESS,
		cvUrl: process.env.CV_URL,
	}

	try {
		return ConfigSchema.parse(rawConfig)
	} catch (error) {
		if (error instanceof z.ZodError) {
			console.error('❌ Invalid configuration:', error.format())
			throw new Error(`Configuration validation failed: ${error.message}`)
		}
		throw error
	}
}

// Server-side config (can read any environment variables)
export const config = parseConfig()

// Helper function to generate social links array
export function getSocialLinks() {
	const links: Array<{
		icon: 'github' | 'linkedin' | 'instagram' | 'mail'
		href: string
		label: string
	}> = []

	if (config.githubUrl) {
		links.push({
			icon: 'github',
			href: config.githubUrl,
			label: 'GitHub',
		})
	}

	if (config.linkedinUrl) {
		links.push({
			icon: 'linkedin',
			href: config.linkedinUrl,
			label: 'LinkedIn',
		})
	}

	if (config.instagramUrl) {
		links.push({
			icon: 'instagram',
			href: config.instagramUrl,
			label: 'Instagram',
		})
	}

	if (config.emailAddress) {
		links.push({
			icon: 'mail',
			href: `mailto:${config.emailAddress}`,
			label: 'Email',
		})
	}

	return links
}

// Server-side function to get config for client components
export function getClientConfig() {
	return {
		socialLinks: getSocialLinks(),
		copyrightYear: new Date().getFullYear(), // Always current year
		cvUrl: config.cvUrl,
	}
}
