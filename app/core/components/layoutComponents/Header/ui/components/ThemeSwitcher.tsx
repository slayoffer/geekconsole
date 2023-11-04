import { useForm } from '@conform-to/react';
import { parse } from '@conform-to/zod';
import { useFetcher } from '@remix-run/react';
import { type Theme } from '~/core/server/index.ts';
import { type action } from '~/root.tsx';
import { ThemeFormSchema } from '~/shared/schemas/index.ts';
import { ErrorList, Icon } from '~/shared/ui/index.ts';

export function ThemeSwitcher({ userPreference }: { userPreference?: Theme }) {
	const fetcher = useFetcher<typeof action>();

	const [form] = useForm({
		id: 'theme-switch',
		lastSubmission: fetcher.data?.submission,
		onValidate({ formData }) {
			return parse(formData, { schema: ThemeFormSchema });
		},
	});

	const mode = userPreference ?? 'light';
	const nextMode = mode === 'light' ? 'dark' : 'light';
	const modeLabel = {
		light: (
			<Icon name="sun">
				<span className="sr-only">Light</span>
			</Icon>
		),
		dark: (
			<Icon name="moon">
				<span className="sr-only">Dark</span>
			</Icon>
		),
	};

	return (
		<fetcher.Form method="POST" {...form.props}>
			<input type="hidden" name="theme" value={nextMode} />
			<div className="flex gap-2">
				<button
					name="intent"
					value="update-theme"
					type="submit"
					className="flex h-8 w-8 cursor-pointer items-center justify-center"
				>
					{modeLabel[mode]}
				</button>
			</div>
			<ErrorList errors={form.errors} id={form.errorId} />
		</fetcher.Form>
	);
}
