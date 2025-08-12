'use client'

import { FileText } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { HomepageLayeredStarField } from '../starfield/LayeredStarField'
import { BrandPanel } from './BrandPanel'
import { ControlPanel } from './ControlPanel'
import { FooterPanel } from './FooterPanel'
import { HeroSection } from './HeroSection'

interface SocialLink {
	icon: 'github' | 'linkedin' | 'instagram' | 'mail'
	href: string
	label: string
}

interface ClientConfig {
	socialLinks: SocialLink[]
	copyrightYear: number
	cvUrl?: string
}

interface PageLayoutProps {
	children?: React.ReactNode
	showStarField?: boolean
	/** Optional override for starfield forward speed */
	speed?: number
	/** Fade-in duration for cluster layer, in milliseconds */
	fadeInDuration?: number
	/** Fade-out duration for cluster layer, in milliseconds */
	fadeOutDuration?: number
	brandName?: string
	heroTitle?: string
	heroDescription?: string
	onPrimaryClick?: () => void
	onSecondaryClick?: () => void
	clientConfig?: ClientConfig
}

export const PageLayout = ({
	children,
	showStarField = true,
	speed,
	fadeInDuration = 3000,
	fadeOutDuration = 3000,
	brandName,
	heroTitle,
	heroDescription,
	onPrimaryClick,
	onSecondaryClick,
	clientConfig,
}: PageLayoutProps) => {
	const [clusterVisible, setClusterVisible] = useState(showStarField)
	// Track star-field forward speed (1200 when cluster ON, 600 when OFF)
	const [starSpeed, setStarSpeed] = useState(clusterVisible ? 1200 : 400)
	useEffect(() => {
		let frameId: number
		let lastTime = performance.now()
		// Different rates: slower accel up, faster decel down
		const accelUp = 1000 // acceleration units per second^2
		const accelDown = 2000 // deceleration units per second^2
		const step = (now: number) => {
			const dt = (now - lastTime) / 1000
			lastTime = now
			setStarSpeed(prev => {
				const target = clusterVisible ? 1200 : 400
				const diff = target - prev
				if (Math.abs(diff) < 1) return target
				// pick accel rate based on direction
				const rate = clusterVisible ? accelUp : accelDown
				const maxDelta = rate * dt
				return prev + Math.sign(diff) * Math.min(Math.abs(diff), maxDelta)
			})
			frameId = requestAnimationFrame(step)
		}
		frameId = requestAnimationFrame(step)
		return () => cancelAnimationFrame(frameId)
	}, [clusterVisible])

	return (
		<div className="relative min-h-screen overflow-hidden bg-black text-white">
			{/* Star Field Background */}
			<HomepageLayeredStarField
				showCluster={clusterVisible}
				// allow story control override; otherwise use animated starSpeed
				speed={speed ?? starSpeed}
				fadeInDuration={fadeInDuration}
				fadeOutDuration={fadeOutDuration}
			/>

			{/* LCARS-style branding panel */}
			<div className="absolute top-8 left-8 z-50">
				<BrandPanel brandName={brandName} />
			</div>

			{/* LCARS-style control panel */}
			<div className="absolute top-8 right-8 z-50 flex items-center gap-3">
				{clientConfig?.cvUrl && (
					<a
						href={clientConfig.cvUrl}
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Download CV (PDF)"
						className="inline-flex items-center gap-2 rounded-full border border-cyan-400/70 bg-black/40 px-3 py-2 text-cyan-300 hover:text-cyan-200"
					>
						<FileText size={16} />
						<span>CV</span>
					</a>
				)}
				<ControlPanel
					darkMode={clusterVisible}
					onToggle={() => setClusterVisible(!clusterVisible)}
				/>
			</div>

			{/* Main content */}
			<div className="relative z-10 flex min-h-screen items-center justify-center px-6">
				{children || (
					<HeroSection
						title={heroTitle}
						description={heroDescription}
						onPrimaryClick={onPrimaryClick}
						onSecondaryClick={onSecondaryClick}
					/>
				)}
			</div>

			{/* LCARS-style footer */}
			<div className="absolute bottom-8 left-1/2 z-50 -translate-x-1/2 transform">
				<FooterPanel
					year={clientConfig?.copyrightYear}
					socialLinks={clientConfig?.socialLinks}
				/>
			</div>
		</div>
	)
}
