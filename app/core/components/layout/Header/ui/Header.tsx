import { Link, useOutletContext } from '@remix-run/react';

import { type OutletContextValues } from '~/shared/models/common';
import { Button } from '~/shared/ui';

export const Header = () => {
  const { session, supabase } = useOutletContext<OutletContextValues>();

  const handleLogout = () => {
    void (async () => {
      await supabase.auth.signOut();
    })();
  };

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
          {session !== null ? (
            <div className="ml-10 hidden space-x-4 lg:block">
              <Button asChild variant="link">
                <Link to="/books">Books</Link>
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="ml-10 hidden space-x-4 lg:block">
              <Button asChild variant="link">
                <Link to="/auth?type=signin">Sign in</Link>
              </Button>
              <Button asChild variant="link">
                <Link to="/auth?type=register">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
        {session !== null ? (
          <div className="flex flex-wrap justify-center space-x-6 py-4 lg:hidden">
            <Button asChild variant="link">
              <Link to="/books">Books</Link>
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center space-x-6 py-4 lg:hidden">
            <Button asChild variant="link">
              <Link to="/auth?type=signin">Sign in</Link>
            </Button>
            <Button asChild variant="link">
              <Link to="/auth?type=register">Sign up</Link>
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
};
