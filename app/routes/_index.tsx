import type { V2_MetaFunction } from '@remix-run/node';

export const meta: V2_MetaFunction = () => {
  return [{ title: 'Geek Console' }];
};

type IndexProps = {
  firstProps: string;
  secondProps: number;
  thirdProps: string[];
};

export default function Index() {
  return <div className="bg-gray-200 text-red-500">Hello world!</div>;
}
