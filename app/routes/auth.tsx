import {
  json,
  redirect,
  type ActionArgs,
  type LoaderArgs,
  type V2_MetaFunction,
} from '@remix-run/node';

import { AuthForm } from '~/core/components/auth';
import { createSupabaseServerClient, validateCredentials } from '~/core/server';

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

        return redirect('/auth?type=signin', { headers: response.headers });
      }

      return json({ message: error.message });
    } else {
      const { error } = await supabaseClient.auth.signInWithPassword(
        credentials,
      );

      if (error !== null) {
        return json({ message: 'Invalid auth credentials' }, { status: 400 });
      }

      return redirect('/books', { headers: response.headers });
    }
  } catch (error) {
    console.log(error);
  }
};
