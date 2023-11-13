import { Form } from '@remix-run/react';
import { z } from 'zod';
import { useIsPending } from '~/app/shared/lib/hooks/index.ts';
import { Icon, StatusButton } from '~/app/shared/ui/index.ts';

const GITHUB_PROVIDER_NAME = 'github';
// to add another provider, set their name here and add it to the providerNames below

export const providerNames = [GITHUB_PROVIDER_NAME] as const;
export const ProviderNameSchema = z.enum(providerNames);
export type ProviderName = z.infer<typeof ProviderNameSchema>;

export const providerLabels: Record<ProviderName, string> = {
	[GITHUB_PROVIDER_NAME]: 'GitHub',
} as const;

export const providerIcons: Record<ProviderName, React.ReactNode> = {
	[GITHUB_PROVIDER_NAME]: <Icon name="github-logo" />,
} as const;

export function ProviderConnectionForm({
	type,
	providerName,
}: {
	type: 'Connect' | 'Login' | 'Signup';
	providerName: ProviderName;
}) {
	const label = providerLabels[providerName];
	const formAction = `/auth/${providerName}`;

	const isPending = useIsPending({ formAction });

	return (
		<Form
			className="flex items-center justify-center gap-2"
			action={formAction}
			method="POST"
		>
			<StatusButton
				type="submit"
				className="w-full"
				status={isPending ? 'pending' : 'idle'}
			>
				<span className="inline-flex items-center gap-1.5">
					{providerIcons[providerName]}
					<span>
						{type} with {label}
					</span>
				</span>
			</StatusButton>
		</Form>
	);
}
