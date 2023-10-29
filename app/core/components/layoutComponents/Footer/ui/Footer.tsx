export const Footer = () => {
	return (
		<footer className="mt-auto bg-zinc-900 p-4 py-16">
			<div className="mx-auto max-w-screen-xl">
				<div className="flex items-center justify-between">
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
						<p className="text-sm text-white">
							© 2022 GeekConsole™. All Rights Reserved
						</p>
					</div>

					<ul className="mb-4 flex flex-wrap items-center text-xl text-gray-400 lg:mb-0">
						<li>
							<a
								href="/"
								className="mr-4 transition duration-300 hover:text-white hover:underline md:mr-6"
								target="_blank"
								rel="noopener noreferrer"
							>
								Home
							</a>
						</li>
						<li>
							<a
								href="https://roadmap.geekconsole.app"
								className="mr-4 transition duration-300 hover:text-white hover:underline md:mr-6"
								target="_blank"
								rel="noopener noreferrer"
							>
								Roadmap
							</a>
						</li>
						<li>
							<a
								href="https://github.com/vVolodya"
								className="mr-4 transition duration-300 hover:text-white hover:underline md:mr-6"
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
