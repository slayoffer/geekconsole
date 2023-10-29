import { type MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => {
	return [{ title: 'Geek Console' }];
};

export default function Index() {
	return (
		<div className="mx-auto mt-16 flex h-full max-w-7xl flex-col items-center px-4 sm:px-6 lg:px-8">
			<div className="text-center">
				<img
					className="mx-auto h-40 w-auto"
					src="images/giphy.gif"
					alt="GeekConsole Logo"
				/>
				<h1 className="mb-3 text-xl text-yellow-400">Welcome to GeekConsole</h1>
				<p className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
					Take full control of your material and digital stuff
				</p>
				<p className="mx-auto mt-5 max-w-xl text-xl text-gray-400">
					Start tracking what you are reading and what you have read.
				</p>
			</div>
		</div>
	);
}
