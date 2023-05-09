import { AppLink } from '~/shared/ui/AppLink/AppLink';

export const Header = () => {
  return (
    <header className="bg-zinc-900">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-center lg:justify-between border-b border-white py-6 lg:border-none">
          <div className="flex items-center">
            <AppLink to="/" variant="unstyled">
              <img
                className="h-12 w-auto"
                src="/images/geekConsole3.png"
                alt="Header logo"
              />
            </AppLink>
          </div>
          <div className="ml-10 space-x-4 hidden lg:block">
            <AppLink to="/login">Sign in</AppLink>
            <AppLink to="/signup">Sign up</AppLink>
          </div>
        </div>
        <div className="flex flex-wrap justify-center space-x-6 py-4 lg:hidden">
          <AppLink to="/login">Sign in</AppLink>
          <AppLink to="/signup">Sign up</AppLink>
        </div>
      </nav>
    </header>
  );
};
