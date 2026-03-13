import { PageLayout } from '@/components/ui/PageLayout'
import { config, getClientConfig } from '@/lib/config'

function getJsonLd() {
	const sameAs = [
		config.githubUrl,
		config.linkedinUrl,
		config.instagramUrl,
	].filter(Boolean)

	return [
		{
			'@context': 'https://schema.org',
			'@type': 'Person',
			name: 'Alex Beverage',
			url: 'https://www.beverage.me',
			jobTitle: 'Agentic Software Engineer',
			description:
				'Agentic software engineer building AI-powered tools ' +
				'including levelang.app, a translator that adapts to ' +
				'skill level, mood, and register.',
			knowsAbout: [
				'Artificial Intelligence',
				'Software Engineering',
				'TypeScript',
				'React',
				'Python',
				'Machine Learning',
				'Language Translation',
				'Natural Language Processing',
			],
			...(sameAs.length > 0 && { sameAs }),
			...(config.emailAddress && {
				email: `mailto:${config.emailAddress}`,
			}),
		},
		{
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: 'beverage.me',
			url: 'https://www.beverage.me',
			description:
				'Personal website and portfolio of Alex Beverage, ' +
				'an agentic software engineer.',
			author: {
				'@type': 'Person',
				name: 'Alex Beverage',
			},
		},
	]
}

export default function Home() {
	const clientConfig = getClientConfig()
	const jsonLd = getJsonLd()

	return (
		<>
			{jsonLd.map((schema, i) => (
				<script
					key={i}
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(schema),
					}}
				/>
			))}
			<PageLayout
				brandName="beverage.me"
				heroTitle="Alex Beverage"
				clientConfig={clientConfig}
			/>
		</>
	)
}
