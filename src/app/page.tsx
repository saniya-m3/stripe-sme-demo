export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-2xl space-y-4 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Stripe SME — Domain Expert API Demo
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Developer tool powered by the Claude API. Ready to build.
        </p>
      </div>
    </main>
  );
}
