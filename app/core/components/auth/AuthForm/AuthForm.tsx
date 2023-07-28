import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form as RemixForm,
  useNavigation,
  useSearchParams,
  useSubmit,
} from '@remix-run/react';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  useToast,
} from '~/shared/ui';

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const authFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({
      message: 'Must be a valid email',
    })
    .transform((email) => email.trim()),
  password: z.string().refine((pass) => passwordRegex.test(pass), {
    message:
      'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character',
  }),
  confirmPassword: z.string(),
});
type AuthFormData = z.infer<typeof authFormSchema>;
const authFormResolver = zodResolver(authFormSchema);

export const AuthForm = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  const submit = useSubmit();

  const isSubmitting = navigation.state === 'submitting';

  const authMode = searchParams.get('type') ?? 'signin';
  const isRegister = authMode === 'register';
  const formTitle = isRegister ? 'Become a member' : 'Sign in to your account';
  const submitBtnCaption = isRegister ? 'Register' : 'Sign in';

  const form = useForm<AuthFormData>({
    resolver: authFormResolver,
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: AuthFormData) => {
    if (isRegister && data.confirmPassword !== data.password) {
      toast({
        title: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    submit(data, { method: 'post' });
  };

  return (
    <Card className="w-[500px]">
      <CardHeader>{formTitle}</CardHeader>
      <CardContent>
        <Form {...form}>
          <RemixForm
            method="post"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3"
          >
            {/* EMAIL */}
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="the-best-email@web.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* PASSWORD */}
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="*****" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* CONFIRM PASSWORD */}
            {isRegister && (
              <FormField
                name="confirmPassword"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <Input placeholder="*****" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                submitBtnCaption
              )}
            </Button>
          </RemixForm>
        </Form>
      </CardContent>
    </Card>
  );
};
