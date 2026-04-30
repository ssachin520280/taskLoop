import Image from "next/image";
import Link from "next/link";
import { EscrowCard } from "@/components/escrow-card";
import { PageShell } from "@/components/page-shell";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { escrows } from "@/lib/mock-data";

const loopSteps = [
  {
    title: "Create escrow",
    description: "Client defines scope, milestones, and the freelancer wallet."
  },
  {
    title: "Submit evidence",
    description: "Freelancer attaches proof while the agent scores completion risk."
  },
  {
    title: "Approve payout",
    description: "Client releases milestone funds once proof and status are aligned."
  }
];

export default function Home() {
  return (
    <PageShell className="py-10">
      <section className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-[var(--brand-strong)]">
            ETHGlobal Open Agents MVP
          </p>
          <h1 className="max-w-4xl text-5xl font-black tracking-tight text-[var(--ink)] sm:text-7xl">
            Escrow workflows for agent-powered work.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            TaskLoop helps clients fund milestones, freelancers submit evidence, and agents evaluate whether work is ready
            for payout.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard" className={buttonClassName("yellow", "px-6 py-3")}>
              Open demo dashboard
            </Link>
            <Link href="/escrows/new" className={buttonClassName("secondary", "px-6 py-3")}>
              Create mock escrow
            </Link>
          </div>
        </div>

        <Card className="overflow-hidden bg-[#fff7df]">
          <CardContent className="p-8">
            <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-[2rem] bg-white shadow-inner">
              <Image src="/taskLoop_logo.png" alt="TaskLoop logo" width={170} height={170} className="object-contain" priority />
            </div>
            <div className="mt-8 rounded-2xl bg-white p-5">
              <p className="text-sm font-bold text-[var(--muted)]">Demo-ready status</p>
              <p className="mt-2 text-3xl font-black text-[var(--ink)]">3 escrows - 7 milestones</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Mock data now, contract calls next.</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        {loopSteps.map((step, index) => (
          <Card key={step.title}>
            <CardContent>
              <span className="text-xs font-black text-[var(--brand-strong)]">0{index + 1}</span>
              <h2 className="mt-3 text-xl font-black text-[var(--ink)]">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--brand-strong)]">Sample flow</p>
            <h2 className="mt-2 text-2xl font-black text-[var(--ink)]">Live mock escrows</h2>
          </div>
          <Link href="/dashboard" className={buttonClassName("ghost")}>
            View all
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {escrows.map((escrow) => (
            <EscrowCard key={escrow.id} escrow={escrow} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
