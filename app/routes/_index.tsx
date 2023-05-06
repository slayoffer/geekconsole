import type { V2_MetaFunction } from '@remix-run/node';

export const meta: V2_MetaFunction = () => {
  return [{ title: 'Geek Console' }];
};

export default function Index() {
  return (
    <div className="bg-gray-200 text-red-500">
      <h2>Hello World</h2>
    </div>
  );
}
