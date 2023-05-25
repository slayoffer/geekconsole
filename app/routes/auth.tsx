import { type ActionArgs } from '@remix-run/node';
import { useSearchParams } from '@remix-run/react';

import { RegisterForm, SignInForm } from '~/core/components/auth';
import { createSupabaseServerClient } from '~/core/server';

export default function Auth() {
  const [searchParams] = useSearchParams();

  const authMode = searchParams.get('type') ?? 'signin';

  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:flex-none xl:border-r-4 xl:border-[#F7BE38] xl:px-24">
        {authMode === 'signin' ? <SignInForm /> : <RegisterForm />}
      </div>
      <div className="hidden w-0 flex-1 items-center justify-center xl:flex">
        <h2>PLACEHOLDER</h2>
      </div>
    </div>
  );
}

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const response = new Response();

  const supabaseClient = createSupabaseServerClient({ response, request });

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
  });

  console.log(data, error);

  return { hello: 'hello' };
};
