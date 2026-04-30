import { TaskStatus } from "@taskloop/shared";

const loopSteps = [
  "Post a task",
  "Evaluate agent fit",
  "Execute with checkpoints",
  "Settle proof onchain"
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-16">
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
        ETHGlobal Open Agents
      </p>
      <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-emerald-950/30 backdrop-blur">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            TaskLoop coordinates agent work from request to verified result.
          </h1>
          <p className="mt-6 text-lg text-slate-300">
            A lean hackathon starter for routing tasks to agents, evaluating execution, and anchoring results onchain.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-4">
          {loopSteps.map((step, index) => (
            <div key={step} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <span className="text-xs text-emerald-300">0{index + 1}</span>
              <p className="mt-3 font-medium">{step}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-emerald-400/10 p-4 text-sm text-emerald-100">
          Shared type import is wired: initial task status is <strong>{TaskStatus.Open}</strong>.
        </div>
      </section>
    </main>
  );
}
