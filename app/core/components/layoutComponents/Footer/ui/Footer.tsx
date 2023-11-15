import { Link } from '@remix-run/react';
import { Button } from '~/app/shared/ui/index.ts';

export const Footer = () => {
	return (
		<footer className="mt-auto bg-background p-4 py-16">
			<div className="mx-auto max-w-screen-xl">
				<div className="flex items-center justify-between">
					<div>
						<div className="mb-6">
							<Link to="/">
								<img
									className="h-8 w-auto"
									src="/images/geekConsole3.png"
									alt="Footer logo"
								/>
							</Link>
						</div>
						<p className="text-sm">
							© {new Date().getFullYear()} GeekConsole™. All Rights Reserved
						</p>
					</div>

					<ul className="mb-4 flex flex-wrap items-center text-[body-lg] text-primary lg:mb-0">
						<li>
							<Button asChild variant="link">
								<Link to="/">Home</Link>
							</Button>
						</li>
						<li>
							<Button asChild variant="link">
								<a
									href="https://roadmap.geekconsole.app"
									target="_blank"
									rel="noopener noreferrer"
								>
									Roadmap
								</a>
							</Button>
						</li>
						<li>
							<Button asChild variant="link">
								<a
									href="https://github.com/vVolodya"
									target="_blank"
									rel="noopener noreferrer"
								>
									Github
								</a>
							</Button>
						</li>
					</ul>
				</div>
			</div>
		</footer>
	);
};
