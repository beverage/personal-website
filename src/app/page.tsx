export const dynamic = 'force-dynamic'

import { PageLayout } from '@/components/ui/PageLayout'
import { getClientConfig } from '@/lib/config'

export default function Home() {
	// Server component - can read environment variables
	const clientConfig = getClientConfig()

	return (
		<PageLayout
			brandName="beverage.me"
			heroTitle="Alex Beverage"
			heroDescription="Under Construction"
			clientConfig={clientConfig}
		/>
	)
}
