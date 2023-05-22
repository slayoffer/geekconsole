import { Link } from '@remix-run/react';
import { Button } from '~/shared/ui/Button/Button';

export const Header = () => {
  return (
    <header className="bg-zinc-900">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-center border-b border-white py-6 lg:justify-between lg:border-none">
          <div className="flex items-center">
            <Link to="/">
              <img
                className="h-12 w-auto"
                src="/images/geekConsole3.png"
                alt="Header logo"
              />
            </Link>
          </div>
          <div className="ml-10 hidden space-x-4 lg:block">
            <Button asChild variant="link">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild variant="link">
              <Link to="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap justify-center space-x-6 py-4 lg:hidden">
          <Button asChild variant="link">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild variant="link">
            <Link to="/signup">Sign up</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
};
