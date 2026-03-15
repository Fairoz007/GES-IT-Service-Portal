import { SignIn } from "@clerk/react";
import { Box, ShieldCheck, Zap, BarChart3 } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Enterprise Security",
    desc: "Role-based access and audit trails built in.",
  },
  {
    icon: Zap,
    title: "Real-Time Operations",
    desc: "Live dashboards and instant ticket updates.",
  },
  {
    icon: BarChart3,
    title: "Operational Intelligence",
    desc: "Analytics across all IT services.",
  },
];

export function Login() {
  return (
    <div
      className="min-h-screen w-full flex flex-col md:flex-row"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ══════════════════════════════════════════
          LEFT / TOP — Blue Branded Panel
          • Mobile  : compact top banner
          • Tablet+ : full-height left column
      ══════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden flex-shrink-0
                   w-full md:w-[46%] lg:w-[50%]
                   flex flex-col"
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e3a5f 55%, #1d4ed8 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #60a5fa, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-15%] left-[-15%] w-[50%] h-[50%] rounded-full opacity-15 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #3b82f6, transparent 70%)",
          }}
        />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* ── Mobile (<md): horizontal logo strip only ── */}
        <div className="md:hidden relative z-10 flex items-center gap-3 py-5 px-5">
          <div className="w-9 h-9 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Box className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">
              GES IT Service Portal
            </p>
            <p className="text-blue-300 text-[9px] font-semibold uppercase tracking-[0.25em]">
              Infrastructure &amp; Operations
            </p>
          </div>
        </div>

        {/* ── Tablet / Desktop (≥md): full panel ── */}
        <div className="hidden md:flex flex-col justify-between flex-1 p-10 lg:p-14 relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/10 backdrop-blur border border-white/20 rounded-2xl flex items-center justify-center shadow-lg">
              <Box className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight tracking-tight">
                GES IT Service Portal
              </p>
              <p className="text-blue-300 text-[10px] font-semibold uppercase tracking-[0.25em]">
                Infrastructure &amp; Operations
              </p>
            </div>
          </div>

          {/* Headline + features */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight">
                IT Service
                <br />
                <span className="text-blue-400">Management,</span>
                <br />
                Simplified.
              </h1>
              <p className="text-blue-200/80 text-sm lg:text-base leading-relaxed max-w-xs">
                A unified platform for GES IT — helpdesk, assets, procurement,
                and operational intelligence.
              </p>
            </div>

            <div className="space-y-4">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-blue-500/20 border border-blue-400/30 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="h-4 w-4 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{title}</p>
                    <p className="text-blue-300/70 text-xs mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-blue-400/40 text-xs tracking-widest uppercase font-medium">
            © 2025 GES IT — All rights reserved
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT / BOTTOM — White Form Panel
      ══════════════════════════════════════════ */}
      <div className="flex-1 min-h-screen md:min-h-0 flex items-center justify-center bg-white px-4 sm:px-8 py-10 md:py-12">
        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="text-center mb-7">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-1">
              Welcome Back
            </h2>
            <p className="text-gray-500 text-sm">
              Sign in to access your portal
            </p>
          </div>

          {/* Clerk Sign In — fully responsive */}
          <SignIn
            appearance={{
              variables: {
                colorPrimary: "#1d4ed8",
                colorBackground: "#ffffff",
                colorText: "#111827",
                colorTextSecondary: "#6b7280",
                colorInputBackground: "#f9fafb",
                colorInputText: "#111827",
                borderRadius: "12px",
                fontFamily: "Inter, sans-serif",
              },
              elements: {
                /* cl-main — margin around the main Clerk widget body */
                main: { margin: "13px" },
                /* Root + card: full width, no extra chrome */
                rootBox: "w-full",
                card: "shadow-none border-0 p-0 bg-transparent w-full",
                /* Hide Clerk's own header since we have ours */
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                /* Social buttons: full width, stack on all sizes */
                socialButtonsBlockButton:
                  "bg-white border border-gray-200 hover:bg-gray-50 " +
                  "text-gray-700 font-medium rounded-xl h-11 transition-all " +
                  "w-full text-sm mb-2",
                socialButtonsBlockButtonText: "text-gray-700 text-sm font-medium",
                socialButtonsProviderIcon: "w-5 h-5",
                /* Social buttons container: column stack */
                socialButtonsRoot: "flex flex-col gap-2 w-full",
                /* Divider */
                dividerLine: "bg-gray-200",
                dividerText: "text-gray-400 text-xs",
                /* Form fields */
                formFieldLabel: "text-gray-700 text-sm font-medium",
                formFieldInput:
                  "bg-gray-50 border border-gray-200 text-gray-900 " +
                  "rounded-xl h-11 text-sm focus:ring-2 focus:ring-blue-500/20 " +
                  "focus:border-blue-500 placeholder:text-gray-400 transition-all w-full",
                formFieldRow: "w-full",
                /* Primary submit button */
                formButtonPrimary:
                  "bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 " +
                  "rounded-xl transition-all shadow-md shadow-blue-500/20 " +
                  "hover:shadow-blue-500/30 w-full mt-1",
                /* Footer links */
                footerActionLink:
                  "text-blue-600 hover:text-blue-700 font-medium text-sm",
                footerActionText: "text-gray-500 text-sm",
                /* Misc */
                identityPreviewText: "text-gray-900",
                formFieldSuccessText: "text-green-600 text-xs",
                formFieldErrorText: "text-red-500 text-xs",
                alertText: "text-red-600 text-sm",
              },
            }}
          />

          {/* Restriction notice */}
          <p className="mt-8 text-gray-400 text-xs text-center leading-relaxed">
            Access is restricted to authorised GES personnel only.
          </p>

          {/* Mobile-only copyright */}
          <p className="md:hidden mt-4 text-gray-300 text-[10px] text-center tracking-widest uppercase">
            © 2025 GES IT — All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}
