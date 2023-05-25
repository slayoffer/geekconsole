import { type ActionArgs } from '@remix-run/node';

import { AuthForm } from '~/core/components/auth';
import { createSupabaseServerClient } from '~/core/server';
import { validateCredentials } from '~/core/server/auth/auth.server';

export default function Auth() {
  return <AuthForm />;
}

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();

  const credentials = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const errors = validateCredentials(credentials);

  if (errors !== undefined) {
    return errors;
  }

  const { searchParams } = new URL(request.url);

  const authMode = searchParams.get('type');

  const response = new Response();

  const supabaseClient = createSupabaseServerClient({ response, request });

  try {
    if (authMode === 'register') {
      const { data, error } = await supabaseClient.auth.signUp(credentials);
    } else {
      const { data, error } = await supabaseClient.auth.signInWithPassword(
        credentials,
      );
    }
  } catch (error) {
    console.log(error);
  }

  return { hello: 'hello' };
};
