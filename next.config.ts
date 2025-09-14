import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	output: 'standalone',

	// Essential security headers
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					// Content Security Policy - prevents XSS attacks
					{
						key: 'Content-Security-Policy',
						value: [
							"default-src 'self'",
							"script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Canvas animations need eval
							"style-src 'self' 'unsafe-inline'",
							"font-src 'self'",
							"img-src 'self' data:",
							"connect-src 'self'",
							"frame-ancestors 'none'", // Prevents clickjacking
						].join('; '),
					},
					// Prevent MIME type sniffing
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
					// Prevent clickjacking
					{
						key: 'X-Frame-Options',
						value: 'DENY',
					},
					// Enable XSS protection
					{
						key: 'X-XSS-Protection',
						value: '1; mode=block',
					},
					// Referrer policy
					{
						key: 'Referrer-Policy',
						value: 'strict-origin-when-cross-origin',
					},
					// Permissions policy
					{
						key: 'Permissions-Policy',
						value: 'camera=(), microphone=(), geolocation=()',
					},
				],
			},
		]
	},
}

export default nextConfig
