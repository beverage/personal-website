import { getClientConfig } from '@/lib/config';
import { VariantsClient } from './VariantsClient';

export default function VariantsPage() {
  const clientConfig = getClientConfig();
  return <VariantsClient cvUrl={clientConfig.cvUrl} clientConfig={clientConfig} />;
}