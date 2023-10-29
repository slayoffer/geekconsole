import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from '@remix-run/node';

import { AuthForm } from '~/core/components/authComponents';
import { createSupabaseServerClient, validateCredentials } from '~/core/server';
import { invariantResponse } from '~/shared/lib/utils';

export const meta: MetaFunction = () => {
  return [{ title: 'Welcome, friend!' }];
};

export default function Auth() {
  return (
    <div className="flex h-full items-center justify-center">
      <AuthForm />
    </div>
  );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response();

  const supabaseClient = createSupabaseServerClient({ response, request });

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (session) return redirect('/');

  return json({ ok: true });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const authMode = searchParams.get('type');

  const formData = await request.formData();

  const credentials = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  if (authMode === 'register') {
    const errors = validateCredentials(credentials);
    if (errors !== undefined) return errors;
  }

  const response = new Response();
  const supabaseClient = createSupabaseServerClient({ response, request });

  if (authMode === 'register') {
    const { data, error } = await supabaseClient.auth.signUp(credentials);

    if (error !== null) {
      return json(error.message, { status: 400 });
    }

    const { error: insertError } = await supabaseClient
      .from('user_profiles')
      .insert([
        {
          id: data.user?.id ?? '',
          username: data.user?.email,
          email: data.user?.email,
        },
      ]);

    invariantResponse(!insertError, insertError?.message, { status: 500 });

    return redirect('/auth?type=signin', { headers: response.headers });
  } else {
    const { error } = await supabaseClient.auth.signInWithPassword(credentials);

    if (error !== null) {
      return json(error.message, { status: 400 });
    }

    return redirect('/books', { headers: response.headers });
  }
};
