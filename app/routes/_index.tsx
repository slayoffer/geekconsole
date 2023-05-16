import type { V2_MetaFunction } from '@remix-run/node';
import { Button } from '~/shared/ui/Button/Button';
import { Input } from '~/shared/ui/Input/Input';

export const meta: V2_MetaFunction = () => {
  return [{ title: 'Geek Console' }];
};

export default function Index() {
  return (
    <div className="mt-16 flex flex-col items-center mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
      <div className="text-center">
        <img
          className="h-40 w-auto mx-auto"
          src="images/giphy.gif"
          alt="GeekConsole Logo"
        />
        <h1 className="text-xl mb-3 text-yellow-400">Welcome to GeekConsole</h1>
        <p className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Take full control of your books.
        </p>
        <p className="mx-auto mt-5 max-w-xl text-xl text-gray-400">
          Start tracking what you are reading and what you have read.
        </p>
      </div>
      <Input placeholder="Test text" />
      <Button className="mt-4" size="large">
        TEST
      </Button>
    </div>
  );
}
