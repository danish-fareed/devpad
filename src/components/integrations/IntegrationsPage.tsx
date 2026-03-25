import { Icon } from "@iconify/react";
import { Layers } from "lucide-react";

type SupportLevel = "yes" | "partial" | "no" | "na" | "coming";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  detected: SupportLevel;
  runnable: SupportLevel;
  autoPrepared: SupportLevel;
  fullyIntegrated: SupportLevel;
}

interface IntegrationCategory {
  id: string;
  title: string;
  description: string;
  integrations: Integration[];
}

const LEVEL_LABELS: Record<SupportLevel, string> = {
  yes: "Yes",
  partial: "Partial",
  no: "No",
  na: "N/A",
  coming: "Coming",
};

const LEVEL_STYLES: Record<SupportLevel, string> = {
  yes: "bg-success-light text-success-dark border-success/20",
  partial: "bg-warning-light text-warning-dark border-warning/20",
  no: "bg-surface-secondary text-text-muted border-border-light",
  na: "bg-surface-secondary text-text-muted border-border-light",
  coming: "bg-accent-light text-accent-dark border-accent/20",
};

const CATEGORIES: IntegrationCategory[] = [
  {
    id: "runtimes",
    title: "Runtimes",
    description: "Core language runtimes and execution environments",
    integrations: [
      {
        id: "nodejs",
        name: "Node.js",
        description: "JavaScript runtime for server-side applications",
        icon: "logos:nodejs-icon",
        detected: "yes",
        runnable: "yes",
        autoPrepared: "yes",
        fullyIntegrated: "partial",
      },
      {
        id: "python",
        name: "Python",
        description: "Python interpreter with venv/pip support",
        icon: "logos:python",
        detected: "yes",
        runnable: "yes",
        autoPrepared: "yes",
        fullyIntegrated: "partial",
      },
      {
        id: "rust",
        name: "Rust",
        description: "Rust toolchain with Cargo",
        icon: "logos:rust",
        detected: "yes",
        runnable: "partial",
        autoPrepared: "no",
        fullyIntegrated: "coming",
      },
      {
        id: "go",
        name: "Go",
        description: "Go toolchain with modules",
        icon: "logos:go",
        detected: "yes",
        runnable: "partial",
        autoPrepared: "no",
        fullyIntegrated: "coming",
      },
    ],
  },
  {
    id: "frameworks",
    title: "Frameworks",
    description: "Web frameworks and application scaffolds",
    integrations: [
      {
        id: "nextjs",
        name: "Next.js",
        description: "React framework with SSR/SSG support",
        icon: "logos:nextjs-icon",
        detected: "yes",
        runnable: "yes",
        autoPrepared: "yes",
        fullyIntegrated: "partial",
      },
      {
        id: "vite",
        name: "Vite",
        description: "Fast frontend build tool",
        icon: "logos:vitejs",
        detected: "yes",
        runnable: "yes",
        autoPrepared: "yes",
        fullyIntegrated: "partial",
      },
      {
        id: "expo",
        name: "Expo",
        description: "React Native development platform",
        icon: "simple-icons:expo",
        detected: "yes",
        runnable: "yes",
        autoPrepared: "yes",
        fullyIntegrated: "partial",
      },
      {
        id: "fastapi",
        name: "FastAPI",
        description: "Modern Python web framework",
        icon: "simple-icons:fastapi",
        detected: "yes",
        runnable: "yes",
        autoPrepared: "yes",
        fullyIntegrated: "partial",
      },
      {
        id: "flask",
        name: "Flask",
        description: "Lightweight Python web framework",
        icon: "simple-icons:flask",
        detected: "yes",
        runnable: "yes",
        autoPrepared: "yes",
        fullyIntegrated: "partial",
      },
      {
        id: "django",
        name: "Django",
        description: "Full-featured Python web framework",
        icon: "simple-icons:django",
        detected: "yes",
        runnable: "yes",
        autoPrepared: "yes",
        fullyIntegrated: "partial",
      },
    ],
  },
  {
    id: "orchestration",
    title: "Orchestration",
    description: "Container and service orchestration tools",
    integrations: [
      {
        id: "docker-compose",
        name: "Docker Compose",
        description: "Multi-container Docker applications",
        icon: "logos:docker-icon",
        detected: "yes",
        runnable: "yes",
        autoPrepared: "partial",
        fullyIntegrated: "partial",
      },
    ],
  },
  {
    id: "cloud-jobs",
    title: "Cloud Jobs",
    description: "Cloud build and deployment services",
    integrations: [
      {
        id: "expo-eas",
        name: "Expo EAS",
        description: "Expo Application Services for builds and submissions",
        icon: "simple-icons:expo",
        detected: "yes",
        runnable: "yes",
        autoPrepared: "na",
        fullyIntegrated: "coming",
      },
      {
        id: "vercel",
        name: "Vercel",
        description: "Cloud platform for frontend deployments",
        icon: "logos:vercel-icon",
        detected: "yes",
        runnable: "yes",
        autoPrepared: "na",
        fullyIntegrated: "coming",
      },
    ],
  },
  {
    id: "env-engines",
    title: "Environment Engines",
    description: "Environment variable management systems",
    integrations: [
      {
        id: "varlock",
        name: "Varlock",
        description: "Encrypted vault-based environment management",
        icon: "mdi:shield-key-outline",
        detected: "yes",
        runnable: "yes",
        autoPrepared: "yes",
        fullyIntegrated: "partial",
      },
      {
        id: "dotenv",
        name: "Dotenv",
        description: "Plain .env file support",
        icon: "simple-icons:dotenv",
        detected: "yes",
        runnable: "yes",
        autoPrepared: "partial",
        fullyIntegrated: "partial",
      },
    ],
  },
  {
    id: "package-managers",
    title: "Package Managers",
    description: "Dependency and environment managers",
    integrations: [
      {
        id: "poetry",
        name: "Poetry",
        description: "Python dependency management",
        icon: "simple-icons:poetry",
        detected: "partial",
        runnable: "partial",
        autoPrepared: "partial",
        fullyIntegrated: "coming",
      },
      {
        id: "conda",
        name: "Conda",
        description: "Cross-platform package manager",
        icon: "simple-icons:anaconda",
        detected: "partial",
        runnable: "partial",
        autoPrepared: "no",
        fullyIntegrated: "coming",
      },
    ],
  },
];

function LevelBadge({ value }: { value: SupportLevel }) {
  return (
    <span
      className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${LEVEL_STYLES[value]}`}
      title={LEVEL_LABELS[value]}
    >
      {LEVEL_LABELS[value]}
    </span>
  );
}

function IntegrationCard({ integration }: { integration: Integration }) {
  const isComingSoon = integration.fullyIntegrated === "coming";

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        isComingSoon
          ? "bg-surface-secondary/30 border-border-light border-dashed"
          : "bg-surface border-border-light hover:border-accent/30 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            isComingSoon ? "bg-surface-tertiary" : "bg-surface-secondary border border-border-light"
          }`}
        >
          <Icon icon={integration.icon} className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-[13px] font-semibold text-text truncate">{integration.name}</h4>
            {isComingSoon && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                Coming Soon
              </span>
            )}
          </div>
          <p className="text-[11px] text-text-muted mt-0.5 line-clamp-2">{integration.description}</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border-light">
        <div className="grid grid-cols-4 gap-1">
          <div className="text-center">
            <div className="text-[8px] text-text-muted uppercase tracking-wider mb-1">Detect</div>
            <LevelBadge value={integration.detected} />
          </div>
          <div className="text-center">
            <div className="text-[8px] text-text-muted uppercase tracking-wider mb-1">Run</div>
            <LevelBadge value={integration.runnable} />
          </div>
          <div className="text-center">
            <div className="text-[8px] text-text-muted uppercase tracking-wider mb-1">Prep</div>
            <LevelBadge value={integration.autoPrepared} />
          </div>
          <div className="text-center">
            <div className="text-[8px] text-text-muted uppercase tracking-wider mb-1">Full</div>
            <LevelBadge value={integration.fullyIntegrated} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CategorySection({ category }: { category: IntegrationCategory }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-[13px] font-semibold text-text">{category.title}</h3>
        <p className="text-[11px] text-text-muted mt-0.5">{category.description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {category.integrations.map((integration) => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>
    </div>
  );
}

export function IntegrationsPage() {
  const totalIntegrations = CATEGORIES.reduce((sum, cat) => sum + cat.integrations.length, 0);
  const comingSoonCount = CATEGORIES.reduce(
    (sum, cat) => sum + cat.integrations.filter((i) => i.fullyIntegrated === "coming").length,
    0
  );
  const availableCount = totalIntegrations - comingSoonCount;

  return (
    <div className="flex-1 overflow-auto p-6 bg-surface">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shadow-sm">
              <Layers size={24} strokeWidth={1.5} className="text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-text">Integrations</h1>
              <p className="text-sm text-text-secondary">
                Supported runtimes, frameworks, and tools
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-surface-secondary rounded-2xl p-5 border border-border-light">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
                <Icon icon="mdi:check-circle-outline" className="w-5 h-5" />
              </div>
              <div>
                <span className="text-text-muted text-[10px] uppercase tracking-wider font-semibold">Available</span>
                <p className="text-xl font-semibold text-text">{availableCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-surface-secondary rounded-2xl p-5 border border-border-light">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Icon icon="mdi:clock-outline" className="w-5 h-5" />
              </div>
              <div>
                <span className="text-text-muted text-[10px] uppercase tracking-wider font-semibold">Coming Soon</span>
                <p className="text-xl font-semibold text-text">{comingSoonCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-surface-secondary rounded-2xl p-5 border border-border-light">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
                <Icon icon="mdi:layers-outline" className="w-5 h-5" />
              </div>
              <div>
                <span className="text-text-muted text-[10px] uppercase tracking-wider font-semibold">Categories</span>
                <p className="text-xl font-semibold text-text">{CATEGORIES.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-surface-secondary/50 rounded-xl p-4 border border-border-light mb-8">
          <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3">Support Levels</h4>
          <div className="flex flex-wrap gap-4 text-[11px] text-text-secondary">
            <div className="flex items-center gap-2">
              <LevelBadge value="yes" />
              <span>Fully supported</span>
            </div>
            <div className="flex items-center gap-2">
              <LevelBadge value="partial" />
              <span>Partially supported</span>
            </div>
            <div className="flex items-center gap-2">
              <LevelBadge value="no" />
              <span>Not yet supported</span>
            </div>
            <div className="flex items-center gap-2">
              <LevelBadge value="na" />
              <span>Not applicable</span>
            </div>
            <div className="flex items-center gap-2">
              <LevelBadge value="coming" />
              <span>In development</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-8">
          {CATEGORIES.map((category) => (
            <CategorySection key={category.id} category={category} />
          ))}
        </div>
      </div>
    </div>
  );
}
