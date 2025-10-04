import { ForegroundToggleProvider } from '@/contexts/ForegroundToggleContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { RenderModeProvider } from '@/contexts/RenderModeContext'
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

// Self-hosted Exo 2 font - optimized WOFF2 variable fonts
const exo2 = localFont({
	src: [
		{
			path: '../../public/fonts/Exo_2/exo2-regular.woff2',
			weight: '100 900',
			style: 'normal',
		},
		{
			path: '../../public/fonts/Exo_2/exo2-italic.woff2',
			weight: '100 900',
			style: 'italic',
		},
	],
	variable: '--font-exo2',
	display: 'swap',
})

export const metadata: Metadata = {
	title: 'beverage.me - Alex Beverage',
	description: "Alex Beverage's Personal Website",

	// SEO Keywords and Author Info
	keywords: [
		'Alex Beverage',
		'agentic developer',
		'portfolio',
		'personal website',
		'ai',
		'sotware engineer',
	],
	authors: [{ name: 'Alex Beverage' }],
	creator: 'Alex Beverage',

	// Mobile browser theme color (matches cyan theme)
	themeColor: '#00bcd4',

	// Canonical URL
	metadataBase: new URL('https://www.beverage.me'),
	alternates: {
		canonical: 'https://www.beverage.me',
	},

	// OpenGraph tags for Facebook, LinkedIn, etc.
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: 'https://www.beverage.me',
		title: 'beverage.me - Alex Beverage',
		description: "Alex Beverage's Personal Portfolio Website",
		siteName: 'beverage.me',
		images: [
			{
				url: '/favicon.ico', // Temporary - replace with social preview image later
				width: 32,
				height: 32,
				alt: 'beverage.me logo',
			},
		],
	},

	// Twitter Card tags
	twitter: {
		card: 'summary_large_image',
		title: 'beverage.me - Alex Beverage',
		description: "Alex Beverage's Personal Portfolio Website",
		images: ['/favicon.ico'], // Temporary - replace with social preview image later
		// creator: '@yourtwitterhandle', // Add your Twitter handle here
	},

	robots: {
		index: true,
		follow: true,
	},
	// Security: Prevent referrer leakage
	referrer: 'strict-origin-when-cross-origin',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" className="bg-black">
			<body className={`${exo2.variable} bg-black text-white antialiased`}>
				<LanguageProvider>
					<RenderModeProvider>
						<ForegroundToggleProvider>{children}</ForegroundToggleProvider>
					</RenderModeProvider>
				</LanguageProvider>
			</body>
		</html>
	)
}
