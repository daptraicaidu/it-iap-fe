const DashboardPage = () => {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
          Admin dashboard
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-zinc-900 md:text-3xl">
          Platform overview
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          This is the initial admin dashboard layout with a sidebar on the left and the
          main content area on the right.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <p className="text-sm font-medium text-zinc-500">Total users</p>
          <p className="mt-3 text-3xl font-semibold text-zinc-900">1,245</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <p className="text-sm font-medium text-zinc-500">Active interviews</p>
          <p className="mt-3 text-3xl font-semibold text-zinc-900">532</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <p className="text-sm font-medium text-zinc-500">AI sessions</p>
          <p className="mt-3 text-3xl font-semibold text-zinc-900">3,847</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <p className="text-sm font-medium text-zinc-500">Pending reviews</p>
          <p className="mt-3 text-3xl font-semibold text-zinc-900">08</p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Main content area</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          You can continue placing admin widgets, user management tables, platform
          analytics, or AI model performance inside this content section.
        </p>
      </div>
    </section>
  );
};

export default DashboardPage;