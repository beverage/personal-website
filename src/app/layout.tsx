import { DebugPanelProvider } from '@/contexts/DebugPanelContext'
import { ForegroundToggleProvider } from '@/contexts/ForegroundToggleContext'
import { GlowProvider } from '@/contexts/GlowContext'
import { HeroTextProvider } from '@/contexts/HeroTextContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { QuizDemoProvider } from '@/contexts/QuizDemoContext'
import { RenderModeProvider } from '@/contexts/RenderModeContext'
import { TwinkleProvider } from '@/contexts/TwinkleContext'
import type { Metadata, Viewport } from 'next'
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
	title: 'Alex Beverage — Agentic Software Engineer | beverage.me',
	description:
		'Alex Beverage is an agentic software engineer building ' +
		'AI-powered tools including levelang.app, a translator that ' +
		'adapts to your skill level, mood, and register. ' +
		'Explore projects, connect, and learn more.',

	keywords: [
		'Alex Beverage',
		'software engineer',
		'agentic developer',
		'agentic software engineer',
		'AI developer',
		'portfolio',
		'beverage.me',
		'levelang',
		'language translation',
		'language learning',
		'React',
		'TypeScript',
		'Python',
		'full stack developer',
	],
	authors: [{ name: 'Alex Beverage', url: 'https://www.beverage.me' }],
	creator: 'Alex Beverage',

	metadataBase: new URL('https://www.beverage.me'),
	alternates: {
		canonical: 'https://www.beverage.me',
	},

	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: 'https://www.beverage.me',
		title: 'Alex Beverage — Agentic Software Engineer',
		description:
			'Agentic software engineer building AI-powered tools ' +
			'including levelang.app — a translator that adapts to skill, ' +
			'mood, and register.',
		siteName: 'beverage.me',
		images: [
			{
				url: '/images/og-preview.png',
				width: 1200,
				height: 630,
				alt: 'Alex Beverage — Agentic Software Engineer',
			},
		],
	},

	twitter: {
		card: 'summary_large_image',
		title: 'Alex Beverage — Agentic Software Engineer',
		description:
			'Agentic software engineer building AI-powered tools ' +
			'including levelang.app — a translator that adapts to skill, ' +
			'mood, and register.',
		images: [
			{
				url: '/images/og-preview.png',
				width: 1200,
				height: 630,
				alt: 'Alex Beverage — Agentic Software Engineer',
			},
		],
	},

	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},

	icons: {
		icon: [
			{
				url: '/images/icon-dark.png',
				media: '(prefers-color-scheme: dark)',
			},
			{
				url: '/images/icon-light.png',
				media: '(prefers-color-scheme: light)',
			},
		],
	},

	referrer: 'strict-origin-when-cross-origin',
}

// Viewport configuration (separate from metadata in Next.js 14+)
export const viewport: Viewport = {
	// Mobile browser theme color (matches cyan theme)
	themeColor: '#00bcd4',
	// Enable full-screen mode on iOS, accounting for notch/safe areas
	viewportFit: 'cover',
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
						<ForegroundToggleProvider>
							<HeroTextProvider>
								<GlowProvider>
									<TwinkleProvider>
										<QuizDemoProvider>
											<DebugPanelProvider>{children}</DebugPanelProvider>
										</QuizDemoProvider>
									</TwinkleProvider>
								</GlowProvider>
							</HeroTextProvider>
						</ForegroundToggleProvider>
					</RenderModeProvider>
				</LanguageProvider>
			</body>
		</html>
	)
}
