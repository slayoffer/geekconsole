export const Footer = () => {
  return (
    <footer className="mt-auto p-4 py-16 bg-zinc-900">
      <div className="mx-auto max-w-screen-xl">
        <div className="flex justify-between items-center">
          <div>
            <div className="mb-6">
              <a href="/">
                <img
                  className="h-8 w-auto"
                  src="/images/geekConsole3.png"
                  alt="Footer logo"
                />
              </a>
            </div>
            <p className="text-white text-sm">
              © 2022 GeekConsole™. All Rights Reserved
            </p>
          </div>

          <ul className="flex flex-wrap items-center mb-4 text-xl lg:mb-0 text-gray-400">
            <li>
              <a
                href="/"
                className="mr-4 hover:underline hover:text-white transition duration-300 md:mr-6"
                target="_blank"
                rel="noopener noreferrer"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="https://roadmap.geekconsole.app"
                className="mr-4 hover:underline hover:text-white transition duration-300 md:mr-6"
                target="_blank"
                rel="noopener noreferrer"
              >
                Roadmap
              </a>
            </li>
            <li>
              <a
                href="https://github.com/vVolodya"
                className="mr-4 hover:underline hover:text-white transition duration-300 md:mr-6"
                target="_blank"
                rel="noopener noreferrer"
              >
                Github
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
