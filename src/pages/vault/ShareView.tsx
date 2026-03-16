import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { 
  Key, 
  Copy, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  ShieldCheck,
  Lock,
  Clock,
  AlertCircle,
  Shield,
  Zap,
  Fingerprint,
  ArrowRight,
  Globe,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function ShareView() {
  const { token } = useParams<{ token: string }>();
  const [showPassword, setShowPassword] = useState(false);
  
  const sharedData = useQuery(api.shares.getSharedCredential, token ? { token } : "skip");
  const incrementView = useMutation(api.shares.incrementView);

  useEffect(() => {
    if (token && sharedData && !sharedData.error) {
      incrementView({ token });
    }
  }, [token, !!sharedData]);

  if (sharedData === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
              <div className="h-16 w-16 bg-primary/10 rounded-3xl mx-auto flex items-center justify-center relative border border-primary/20">
                <Shield className="h-8 w-8 text-primary animate-bounce" />
              </div>
          </div>
          <div className="space-y-2">
            <div className="h-8 w-48 bg-secondary/50 rounded-xl mx-auto animate-pulse" />
            <div className="h-4 w-64 bg-secondary/30 rounded-lg mx-auto animate-pulse" />
          </div>
          <div className="h-48 bg-secondary/20 rounded-[2.5rem] animate-pulse border border-border/50" />
        </div>
      </div>
    );
  }

  if (!sharedData || sharedData.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md border-none shadow-[0_32px_64px_-16px_rgba(239,68,68,0.15)] rounded-[3rem] overflow-hidden bg-card/60 backdrop-blur-xl">
          <div className="h-2 bg-rose-500" />
          <CardHeader className="text-center p-10">
            <div className="w-20 h-20 rounded-[2rem] bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto mb-6 shadow-xl shadow-rose-500/5 border border-rose-500/20">
              <AlertCircle className="h-10 w-10" />
            </div>
            <CardTitle className="text-3xl font-black tracking-tight">Access Revoked</CardTitle>
            <p className="text-muted-foreground mt-2 font-medium">
              {sharedData?.error || "This secure link has expired, reached its view limit, or was destroyed by the owner."}
            </p>
          </CardHeader>
          <CardContent className="px-10 pb-10 flex flex-col gap-3">
            <Button asChild className="h-14 rounded-2xl font-black text-lg bg-primary shadow-xl shadow-primary/20 group">
              <Link to="/" className="flex items-center justify-center gap-2">
                Back to Portal <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <p className="text-[10px] text-center font-black uppercase tracking-[0.2em] text-muted-foreground/60 mt-4">
               ERROR_CODE: SEC_LINK_EXPIRED
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-xl space-y-10 relative z-10">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary mx-auto mb-6 shadow-2xl shadow-primary/10 ring-1 ring-primary/20 transition-transform hover:scale-105 duration-500">
            <ShieldCheck className="h-12 w-12" />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter">Secure Transmission</h1>
            <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-md mx-auto">
              This encrypted packet was shared via the <span className="text-primary font-bold">GES Security Vault</span>.
            </p>
          </div>
        </div>

        <Card className="border-none shadow-[0_48px_96px_-16px_rgba(0,0,0,0.12)] rounded-[3.5rem] overflow-hidden bg-card/40 backdrop-blur-2xl">
          <CardHeader className="p-10 pb-6 border-b border-border/30 bg-secondary/10 relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-primary/50 to-primary" />
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[1.5rem] bg-primary flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20">
                <Fingerprint className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black tracking-tight">{sharedData.label}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-primary/5 text-primary border-none px-2 h-5">
                        {sharedData.category}
                    </Badge>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">End-to-End Encrypted</span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 p-10 pt-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">Identity Identifier</Label>
                <div className="group relative h-16 flex items-center px-6 rounded-2xl bg-secondary/30 border border-transparent hover:border-primary/20 transition-all">
                  <p className="flex-1 font-bold text-lg select-all truncate">{sharedData.username}</p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-background/50"
                    onClick={() => copyToClipboard(sharedData?.username || '', 'Username')}
                  >
                    <Copy className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">Secure Access Key</Label>
                <div className="group relative h-16 flex items-center px-6 rounded-2xl bg-secondary/30 border border-transparent hover:border-primary/20 transition-all">
                  <p className="flex-1 font-mono text-xl tracking-[0.4em] font-medium transition-all select-all">
                    {showPassword ? sharedData.password : '••••••••••••'}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 rounded-xl bg-background/50 hover:bg-background"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 hover:bg-background"
                      onClick={() => copyToClipboard(sharedData?.password || '', 'Password')}
                    >
                      <Copy className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {sharedData.url && (
                <div className="pt-2">
                  <Button asChild className="w-full h-16 rounded-2xl gap-3 font-black text-lg bg-secondary/20 hover:bg-secondary/40 text-foreground border-2 border-border/50 transition-all group shadow-sm">
                    <a href={sharedData.url.startsWith('http') ? sharedData.url : `https://${sharedData.url}`} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-6 w-6 text-primary" />
                      Explore Endpoint 
                      <ExternalLink className="h-5 w-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all ml-auto" />
                    </a>
                  </Button>
                </div>
              )}

              {sharedData.notes && (
                <div className="space-y-3 pt-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">Transmission Notes</Label>
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-base leading-relaxed italic text-foreground/80 relative overflow-hidden">
                    {sharedData.notes}
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <FileText className="h-12 w-12" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-8 border-t border-border/30 text-center space-y-6">
              <div className="flex flex-col items-center gap-1.5 opacity-60">
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">
                    Powered by GES IT SECURITY
                </p>
                <div className="flex items-center gap-2">
                    <span className="h-1 w-8 bg-primary/30 rounded-full" />
                    <Zap className="h-4 w-4 text-primary fill-primary" />
                    <span className="h-1 w-8 bg-primary/30 rounded-full" />
                </div>
              </div>
              
              <Button asChild variant="link" className="text-sm font-bold text-primary group">
                <Link to="/" className="flex items-center gap-2">
                    Initialize Your Own Secure Vault <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex items-center justify-center gap-6 opacity-40">
            <div className="flex items-center gap-2">
                <Lock className="h-3 w-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">SSL Secure</span>
            </div>
            <div className="flex items-center gap-2">
                <ShieldCheck className="h-3 w-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">Encrypted Packet</span>
            </div>
            <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">Auto-Destruct Active</span>
            </div>
        </div>
      </div>
    </div>
  );
}
