import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
      <h2 className="text-3xl font-bold text-gray-900">404 - Not Found</h2>
      <p className="mt-2 text-gray-600 mb-6">Could not find requested resource</p>
      <Link href="/">
        <span className="rounded-md bg-[var(--primary-green)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--primary-hover)] cursor-pointer">
          Return Home
        </span>
      </Link>
    </div>
  )
}
