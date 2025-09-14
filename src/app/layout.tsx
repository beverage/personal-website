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
	title: 'beverage.me - Personal Website',
	description:
		"Alex Beverage's personal website featuring interactive star field animations",
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
		<html lang="en">
			<body className={`${exo2.variable} antialiased`}>{children}</body>
		</html>
	)
}
