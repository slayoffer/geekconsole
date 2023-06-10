import {
  json,
  redirect,
  type ActionArgs,
  type LoaderArgs,
  type V2_MetaFunction,
} from '@remix-run/node';

import { AuthForm } from '~/core/components/auth';
import { createSupabaseServerClient } from '~/core/server';
import { validateCredentials } from '~/core/server/auth/auth.server';

export const meta: V2_MetaFunction = () => {
  return [{ title: 'Welcome, friend!' }];
};

export default function Auth() {
  return <AuthForm />;
}

export const loader = async ({ request }: LoaderArgs) => {
  const response = new Response();

  const supabaseClient = createSupabaseServerClient({ response, request });

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (session !== null) {
    return redirect('/');
  }

  return json({ ok: true });
};

export const action = async ({ request }: ActionArgs) => {
  const { searchParams } = new URL(request.url);
  const authMode = searchParams.get('type');

  const formData = await request.formData();

  const credentials = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  if (authMode === 'register') {
    const errors = validateCredentials(credentials);

    if (errors !== undefined) {
      return errors;
    }
  }

  const response = new Response();

  const supabaseClient = createSupabaseServerClient({ response, request });

  try {
    if (authMode === 'register') {
      const { data, error } = await supabaseClient.auth.signUp(credentials);

      if (error === null) {
        await supabaseClient
          .from('user_profiles')
          .insert([{ id: data.user?.id }]);
      }
    } else {
      const { error } = await supabaseClient.auth.signInWithPassword(
        credentials,
      );

      if (error !== null) {
        return json({ message: 'Invalid auth credentials' }, { status: 400 });
      }
    }
  } catch (error) {
    console.log(error);
  }

  return redirect('/books', { headers: response.headers });
};
