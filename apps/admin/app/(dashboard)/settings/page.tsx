export default function Page() {
  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="text-sm font-semibold text-[var(--primary-green)] uppercase tracking-[0.2em]">
          Settings
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-gray-900">Account settings</h1>
        <p className="mt-3 max-w-2xl text-base text-gray-600">
          Update your profile details, change your password, and manage notification preferences.
        </p>
      </div>

      <div className="space-y-10">
        <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-2 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Personal details</h2>
            <p className="text-sm text-gray-500">Edit your name, email, and phone number.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-gray-700">
              <span>Full name</span>
              <input
                type="text"
                placeholder="Jane Doe"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-[var(--primary-green)] focus:outline-none focus:ring-2 focus:ring-[rgba(16,185,129,0.12)]"
              />
            </label>
            <label className="space-y-2 text-sm text-gray-700">
              <span>Email address</span>
              <input
                type="email"
                placeholder="jane.doe@example.com"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-[var(--primary-green)] focus:outline-none focus:ring-2 focus:ring-[rgba(16,185,129,0.12)]"
              />
            </label>
            <label className="space-y-2 text-sm text-gray-700 sm:col-span-2">
              <span>Phone number</span>
              <input
                type="tel"
                placeholder="+1 (555) 123-4567"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-[var(--primary-green)] focus:outline-none focus:ring-2 focus:ring-[rgba(16,185,129,0.12)]"
              />
            </label>
          </div>
          <div className="mt-6 flex justify-end">
            <button className="rounded-2xl bg-[var(--primary-green)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--primary-hover)] transition-colors">
              Save personal details
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-2 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Update password</h2>
            <p className="text-sm text-gray-500">Change your account password to keep your account secure.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-gray-700">
              <span>Current password</span>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-[var(--primary-green)] focus:outline-none focus:ring-2 focus:ring-[rgba(16,185,129,0.12)]"
              />
            </label>
            <label className="space-y-2 text-sm text-gray-700">
              <span>New password</span>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-[var(--primary-green)] focus:outline-none focus:ring-2 focus:ring-[rgba(16,185,129,0.12)]"
              />
            </label>
            <label className="space-y-2 text-sm text-gray-700 sm:col-span-2">
              <span>Confirm new password</span>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-[var(--primary-green)] focus:outline-none focus:ring-2 focus:ring-[rgba(16,185,129,0.12)]"
              />
            </label>
          </div>
          <div className="mt-6 flex justify-end">
            <button className="rounded-2xl bg-[var(--primary-green)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--primary-hover)] transition-colors">
              Update password
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-2 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-500">Choose how you want to receive alerts and updates.</p>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Email notifications</p>
                <p className="text-sm text-gray-500">Receive account updates, product alerts, and news by email.</p>
              </div>
              <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-[var(--primary-green)]" checked readOnly />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">SMS notifications</p>
                <p className="text-sm text-gray-500">Get important alerts on your mobile phone.</p>
              </div>
              <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-[var(--primary-green)]" />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Product alerts</p>
                <p className="text-sm text-gray-500">Receive notifications for inventory, orders, and product updates.</p>
              </div>
              <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-[var(--primary-green)]" checked readOnly />
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}
