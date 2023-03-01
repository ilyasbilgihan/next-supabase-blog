import Link from 'next/link';

export default function FourOhFour() {
  return (
    <div className="py-12 flex flex-col gap-y-2">
      <h1 className="text-red-400">404 - Page Not Found</h1>
      <Link href="/">Go back home</Link>
    </div>
  );
}
