import { SignIn } from "@clerk/react";
import { Shield, Box } from "lucide-react";

export function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center p-6 relative z-10">
        {/* Left Side - Info */}
        <div className="hidden lg:block space-y-12 pr-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Box className="h-7 w-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-white uppercase">GES IT Service Portal</span>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em]">Infrastructure & Operations</span>
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-6xl font-black text-white leading-tight">
              Manage your <span className="text-primary italic">operations</span> with precision.
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              The all-in-one platform for GES IT service management, asset tracking, and operational intelligence.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2 border-l-2 border-primary/20 pl-6">
              <h4 className="text-3xl font-bold text-white tracking-tighter">99.9%</h4>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">System Uptime</p>
            </div>
            <div className="space-y-2 border-l-2 border-primary/20 pl-6">
              <h4 className="text-3xl font-bold text-white tracking-tighter">&lt; 15m</h4>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Mean Response</p>
            </div>
          </div>
        </div>

        {/* Right Side - Clerk Login */}
        <div className="flex justify-center">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "w-full scale-110 md:scale-125",
                card: "bg-zinc-900 border border-zinc-800 shadow-2xl",
                headerTitle: "text-white font-bold",
                headerSubtitle: "text-zinc-400",
                socialButtonsBlockButton: "bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white",
                formButtonPrimary: "bg-primary hover:bg-primary/90 text-white font-bold h-11 rounded-xl",
                formFieldInput: "bg-zinc-800 border-zinc-700 text-white rounded-xl focus:ring-primary/20",
                footerActionLink: "text-primary hover:text-primary/80",
                identityPreviewText: "text-white",
                userButtonPopoverActionButtonText: "text-white"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
