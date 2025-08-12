import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('config', () => {
	const prevEnv = { ...process.env }
	beforeEach(() => {
		process.env = { ...prevEnv }
	})

	it('accepts same-origin cvUrl path', async () => {
		process.env.CV_URL = '/cv/test.pdf'
		// Force re-parse by re-importing module via dynamic import
		vi.resetModules()
		const fresh = await import('../config')
		const { cvUrl } = fresh.getClientConfig()
		expect(cvUrl).toBe('/cv/test.pdf')
	})

	it('builds social links from env', async () => {
		process.env.GITHUB_PROFILE_URL = 'https://github.com/test'
		process.env.LINKEDIN_PROFILE_URL = 'https://linkedin.com/in/test'
		process.env.INSTAGRAM_PROFILE_URL = 'https://instagram.com/test'
		process.env.CONTACT_EMAIL_ADDRESS = 'test@example.com'
		vi.resetModules()
		const fresh = await import('../config')
		const links = fresh.getSocialLinks()
		expect(links.find(l => l.icon === 'github')?.href).toContain('github.com')
		expect(links.find(l => l.icon === 'linkedin')?.href).toContain(
			'linkedin.com',
		)
		expect(links.find(l => l.icon === 'instagram')?.href).toContain(
			'instagram.com',
		)
		expect(links.find(l => l.icon === 'mail')?.href).toContain('mailto:')
	})
})
