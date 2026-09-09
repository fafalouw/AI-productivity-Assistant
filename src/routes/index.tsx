import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Bot,
  Calendar,
  CheckCircle2,
  FileText,
  Inbox,
  LayoutDashboard,
  Mail,
  MoreHorizontal,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  UserPlus,
  Wand2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { generateWorkflow } from "@/lib/workflows.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Relay — Workplace Task Automation" },
      { name: "description", content: "Automate repetitive workplace tasks with Relay. Build workflows, track runs, and reclaim hours every week." },
      { property: "og:title", content: "Relay — Workplace Task Automation" },
      { property: "og:description", content: "Automate repetitive workplace tasks with Relay. Build workflows, track runs, and reclaim hours every week." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Zap, label: "Automations", active: false },
  { icon: Play, label: "Runs", active: false },
  { icon: FileText, label: "Templates", active: false },
  { icon: Calendar, label: "Schedule", active: false },
];

const metrics = [
  { label: "Active automations", value: "12", change: "+2 this week", tone: "neutral" as const },
  { label: "Tasks completed today", value: "348", change: "+12% vs yesterday", tone: "positive" as const },
  { label: "Avg. run time", value: "1.4s", change: "steady", tone: "neutral" as const },
  { label: "Queue", value: "3", change: "1 needs review", tone: "warning" as const },
];

const automations = [
  {
    id: 1,
    name: "Weekly report compiler",
    description: "cron · 07:00 Mon · 6 steps · owner: Ito",
    status: "running" as const,
    success: "98.2%",
    icon: FileText,
  },
  {
    id: 2,
    name: "Invoice receipt → ledger",
    description: "on event · 9 steps · owner: Marsh",
    status: "running" as const,
    success: "100%",
    icon: Mail,
  },
  {
    id: 3,
    name: "Onboarding email sequence",
    description: "trigger: signup · 4 steps · owner: Vale",
    status: "paused" as const,
    success: "—",
    icon: UserPlus,
  },
  {
    id: 4,
    name: "Inbox triage → tasks",
    description: "on event · 5 steps · owner: Ito",
    status: "running" as const,
    success: "96.7%",
    icon: Inbox,
  },
];

const templates = [
  {
    title: "Digest & summary",
    description: "Collect sources, roll up, deliver by 08:00.",
    steps: "3 steps",
    icon: FileText,
  },
  {
    title: "Handoff router",
    description: "Route incoming work to the right owner by tag.",
    steps: "4 steps",
    icon: Zap,
  },
  {
    title: "Filing & archive",
    description: "Sort, tag and archive completed items nightly.",
    steps: "5 steps",
    icon: CheckCircle2,
  },
];

const recentRuns = [
  { name: "Invoice receipt → ledger", time: "09:42", duration: "1.1s", status: "success" as const },
  { name: "Inbox triage → tasks", time: "09:38", duration: "0.9s", status: "success" as const },
  { name: "Weekly report compiler", time: "09:41", duration: "step 4 of 6", status: "running" as const },
  { name: "Filing & archive", time: "09:12", duration: "needs review", status: "warning" as const },
  { name: "Digest & summary", time: "08:00", duration: "2.3s", status: "success" as const },
  { name: "Handoff router", time: "07:52", duration: "1.6s", status: "success" as const },
];

type GeneratedWorkflow = {
  name: string;
  trigger: { source: string; condition: string };
  actions: { step: number; action: string; tool: string }[];
  confidence: number;
  explanation: string;
  requiresReview: boolean;
};

function StatusBadge({ status }: { status: "running" | "paused" | "success" | "warning" }) {
  const variants = {
    running: { label: "Running", className: "bg-info/10 text-info border-info/20" },
    paused: { label: "Paused", className: "bg-muted text-muted-foreground border-border" },
    success: { label: "Done", className: "bg-success/10 text-success border-success/20" },
    warning: { label: "Review", className: "bg-warning/10 text-warning border-warning/20" },
  };
  const config = variants[status];
  return (
    <Badge variant="outline" className={`font-medium ${config.className}`}>
      {status === "running" && <span className="mr-1.5 inline-block size-1.5 rounded-full bg-current animate-pulse-soft" />}
      {config.label}
    </Badge>
  );
}

function MetricCard({
  label,
  value,
  change,
  tone,
}: {
  label: string;
  value: string;
  change: string;
  tone: "positive" | "warning" | "neutral";
}) {
  const toneClasses = {
    positive: "text-success",
    warning: "text-warning",
    neutral: "text-muted-foreground",
  };
  return (
    <Card className="border-border/60 bg-card">
      <CardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-card-foreground">{value}</p>
        <p className={`mt-1 text-xs font-medium ${toneClasses[tone]}`}>{change}</p>
      </CardContent>
    </Card>
  );
}

function Sidebar() {
  return (
    <aside className="hidden w-16 shrink-0 flex-col items-center border-r border-border bg-sidebar py-5 lg:flex">
      <Link to="/" className="mb-6 flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Bot className="size-5" />
      </Link>
      <nav className="flex flex-1 flex-col gap-1.5">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`flex size-10 items-center justify-center rounded-xl transition-colors ${
              item.active
                ? "bg-primary/10 text-primary"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
            aria-label={item.label}
          >
            <item.icon className="size-5" />
          </button>
        ))}
      </nav>
      <button
        className="flex size-10 items-center justify-center rounded-xl text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        aria-label="Settings"
      >
        <Settings className="size-5" />
      </button>
    </aside>
  );
}

function Header() {
  return (
    <header className="flex flex-col gap-4 border-b border-border/60 bg-background/80 px-6 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Control Center</p>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Relay</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 sm:flex">
          <Search className="size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Search</span>
          <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">⌘K</kbd>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" />
          New automation
        </Button>
      </div>
    </header>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const percentage = Math.round(confidence * 100);
  let tone = "bg-success/10 text-success border-success/20";
  if (percentage < 70) tone = "bg-warning/10 text-warning border-warning/20";
  if (percentage < 50) tone = "bg-destructive/10 text-destructive border-destructive/20";
  return (
    <Badge variant="outline" className={`font-medium ${tone}`}>
      {percentage}% confidence
    </Badge>
  );
}

function AIWorkflowBuilder() {
  const [description, setDescription] = useState("");
  const [workflow, setWorkflow] = useState<GeneratedWorkflow | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generate = useServerFn(generateWorkflow);

  const handleGenerate = async () => {
    setError(null);
    setWorkflow(null);
    setIsGenerating(true);
    try {
      const result = await generate({ data: { description } });
      setWorkflow(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not generate workflow. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = () => {
    toast.success(`${workflow?.name} added to active automations.`);
    setWorkflow(null);
    setDescription("");
  };

  return (
    <Card className="overflow-hidden border-border/60 bg-card">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-primary/5 to-transparent pb-4">
        <div className="flex items-center gap-2">
          <Wand2 className="size-5 text-primary" />
          <CardTitle className="text-base font-semibold text-card-foreground">AI workflow builder</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Describe a repetitive workplace task in plain language and Relay will propose a safe automation with human review.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <div className="space-y-2">
          <Textarea
            placeholder="Example: Every Monday at 9am, collect last week's support tickets from Slack, summarize them, and email the summary to the team lead."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px] resize-none border-input bg-background"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{description.length} characters</p>
            <Button
              size="sm"
              onClick={handleGenerate}
              disabled={description.length < 10 || isGenerating}
              className="gap-1.5"
            >
              {isGenerating ? <RefreshCw className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {isGenerating ? "Designing workflow..." : "Generate workflow"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {workflow && (
          <div className="space-y-4 rounded-xl border border-border/60 bg-soft p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-soft-foreground">{workflow.name}</h3>
              <div className="flex items-center gap-2">
                <ConfidenceBadge confidence={workflow.confidence} />
                {workflow.requiresReview && (
                  <Badge variant="outline" className="bg-warning/10 font-medium text-warning border-warning/20">
                    Needs review
                  </Badge>
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{workflow.explanation}</p>

            <div className="space-y-3">
              <div className="rounded-lg border border-border/60 bg-background p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Trigger</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {workflow.trigger.source} — {workflow.trigger.condition}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</p>
                <ol className="space-y-2">
                  {workflow.actions.map((action) => (
                    <li
                      key={action.step}
                      className="flex items-start gap-3 rounded-lg border border-border/60 bg-background p-3"
                    >
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                        {action.step}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{action.action}</p>
                        <p className="text-xs text-muted-foreground">{action.tool}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button size="sm" onClick={handleApprove} className="gap-1.5">
                <CheckCircle2 className="size-4" />
                {workflow.requiresReview ? "Approve & schedule" : "Activate now"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setWorkflow(null)}>
                Discard
              </Button>
            </div>

            {workflow.requiresReview && (
              <p className="text-xs text-muted-foreground">
                This workflow is flagged for review because it may involve sensitive data, spending, or unclear handoffs.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Index() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
            {/* Main column */}
            <div className="space-y-6 lg:col-span-2">
              {/* Metrics */}
              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {metrics.map((metric) => (
                  <MetricCard key={metric.label} {...metric} />
                ))}
              </section>

              {/* AI Workflow Builder */}
              <AIWorkflowBuilder />

              {/* Active automations */}
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Active automations
                  </h2>
                  <span className="text-xs text-muted-foreground">12 running</span>
                </div>
                <div className="space-y-3">
                  {automations.map((automation) => (
                    <Card
                      key={automation.id}
                      className="group cursor-pointer border-border/60 bg-card transition-colors hover:border-primary/20 hover:bg-accent/30"
                    >
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <automation.icon className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-card-foreground">{automation.name}</h3>
                            <StatusBadge status={automation.status} />
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">{automation.description}</p>
                        </div>
                        <div className="hidden shrink-0 text-right sm:block">
                          <p className="text-sm font-semibold text-card-foreground">{automation.success}</p>
                          <p className="text-[11px] text-muted-foreground">success</p>
                        </div>
                        <button className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                          <MoreHorizontal className="size-4" />
                        </button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Templates */}
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Start from a template
                  </h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {templates.map((template) => (
                    <Card
                      key={template.title}
                      className="cursor-pointer border-border/60 bg-card transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-sm"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="bg-secondary text-secondary-foreground">
                            Starter
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{template.steps}</span>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <template.icon className="size-4 text-primary" />
                          <h3 className="font-semibold text-card-foreground">{template.title}</h3>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            </div>

            {/* Activity feed */}
            <div className="lg:col-span-1">
              <Card className="border-border/60 bg-card">
                <CardHeader className="border-b border-border/60 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Recent runs
                    </CardTitle>
                    <Badge variant="outline" className="bg-secondary text-secondary-foreground">
                      live
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="divide-y divide-border/60">
                    {recentRuns.map((run, index) => (
                      <li key={`${run.name}-${index}`} className="flex items-start gap-3 px-4 py-3">
                        <span
                          className={`mt-1.5 size-2 shrink-0 rounded-full ${
                            run.status === "success"
                              ? "bg-success"
                              : run.status === "running"
                                ? "bg-info animate-pulse-soft"
                                : "bg-warning"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-card-foreground">{run.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {run.time} · {run.duration}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="mt-4 border-border/60 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Sparkles className="size-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">AI suggestions</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Relay found 3 repetitive tasks in your inbox that could be automated.
                      </p>
                      <Button variant="link" size="sm" className="mt-1 h-auto px-0 py-0 text-xs">
                        Review suggestions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
