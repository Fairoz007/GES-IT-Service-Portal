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
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        <div className="w-full max-w-md space-y-4 text-center">
          <div className="h-12 w-12 bg-primary/10 rounded-2xl mx-auto animate-pulse" />
          <div className="h-8 w-48 bg-secondary/50 rounded-xl mx-auto animate-pulse" />
          <div className="h-32 bg-secondary/30 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!sharedData || sharedData.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md border-destructive/20 shadow-2xl shadow-destructive/5 rounded-3xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mx-auto mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-bold">Link Unavailable</CardTitle>
            <CardDescription>
              {sharedData?.error || "This share link is invalid or has been removed."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild className="rounded-xl px-8">
              <Link to="/">Back to Home</Link>
            </Button>
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
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6 shadow-inner ring-1 ring-primary/20">
            <Lock className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Secure Shared Entry</h1>
          <p className="text-muted-foreground">This information was shared with you securely via Security Vault.</p>
        </div>

        <Card className="border-border/50 shadow-2xl shadow-primary/5 rounded-[2.5rem] overflow-hidden bg-card/50 backdrop-blur-xl">
          <CardHeader className="pb-4 border-b border-border/30 bg-secondary/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">{sharedData.label}</CardTitle>
                <CardDescription className="text-xs uppercase font-bold tracking-widest opacity-60">
                  {sharedData.category}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Username</Label>
                <div className="flex items-center gap-2 p-4 rounded-2xl bg-secondary/40 border border-border/20 group">
                  <p className="flex-1 font-medium select-all">{sharedData.username}</p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyToClipboard(sharedData?.username || '', 'Username')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Password</Label>
                <div className="flex items-center gap-2 p-4 rounded-2xl bg-secondary/40 border border-border/20 group">
                  <p className="flex-1 font-mono tracking-wider select-all">
                    {showPassword ? sharedData.password : '••••••••••••••••'}
                  </p>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-xl"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(sharedData?.password || '', 'Password')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {sharedData.url && (
                <div className="pt-2">
                  <Button asChild variant="outline" className="w-full rounded-2xl h-12 gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all">
                    <a href={sharedData.url.startsWith('http') ? sharedData.url : `https://${sharedData.url}`} target="_blank" rel="noopener noreferrer">
                      Visit Website <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              )}

              {sharedData.notes && (
                <div className="space-y-2 pt-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Notes</Label>
                  <div className="p-4 rounded-2xl bg-secondary/20 border border-border/20 text-sm whitespace-pre-wrap italic text-muted-foreground">
                    {sharedData.notes}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-border/30 text-center">
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mb-4">
                Powered by Security Vault
              </p>
              <Button asChild variant="link" className="text-xs">
                <Link to="/">Create your own secure vault</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
