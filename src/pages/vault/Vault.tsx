import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { 
  Key, 
  Plus, 
  Search, 
  Copy, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  ShieldCheck,
  Tag,
  Clock,
  Briefcase,
  Lock,
  Globe,
  Database,
  Share2,
  Star,
  Shield,
  Zap,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Fingerprint
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function Vault() {
  const [search, setSearch] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  
  const credentials = useQuery(api.credentials.list);
  const createCredential = useMutation(api.credentials.create);
  const updateCredential = useMutation(api.credentials.update);
  const deleteCredential = useMutation(api.credentials.remove);
  const toggleFavorite = useMutation(api.credentials.toggleFavorite);
  const createShare = useMutation(api.shares.create);

  const [editingCred, setEditingCred] = useState<any>(null);
  const [sharingCred, setSharingCred] = useState<any>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [shareExpiration, setShareExpiration] = useState('24');
  
  const stats = useMemo(() => {
    if (!credentials) return { total: 0, strong: 0, shared: 0, favorites: 0 };
    return {
      total: credentials.length,
      strong: credentials.filter(c => c.password.length >= 12).length,
      shared: 0, // Would need a join or count from shares table
      favorites: credentials.filter(c => c.isFavorite).length
    };
  }, [credentials]);

  if (credentials === undefined || credentials === null) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <div className="h-16 w-64 bg-secondary/50 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-secondary/30 rounded-3xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const filteredCredentials = (credentials || [])
    .filter(c => {
      const matchesSearch = (c?.label || '').toLowerCase().includes(search.toLowerCase()) || 
                           (c?.username || '').toLowerCase().includes(search.toLowerCase()) ||
                           (c?.category || '').toLowerCase().includes(search.toLowerCase());
      const matchesFavorite = showFavoritesOnly ? c.isFavorite : true;
      return matchesSearch && matchesFavorite;
    });

  const togglePasswordVisibility = (id: string) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleDelete = async (id: any) => {
    try {
      await deleteCredential({ id });
      toast.success('Credential deleted successfully');
    } catch (error) {
      toast.error('Failed to delete credential');
    }
  };

  const [newCred, setNewCred] = useState({
    label: '',
    username: '',
    password: '',
    url: '',
    notes: '',
    category: 'Application',
    tags: [] as string[],
    isFavorite: false
  });

  const generatePassword = () => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    const all = uppercase + lowercase + numbers + symbols;
    
    let pass = "";
    // Ensure at least one of each
    pass += uppercase[Math.floor(Math.random() * uppercase.length)];
    pass += lowercase[Math.floor(Math.random() * lowercase.length)];
    pass += numbers[Math.floor(Math.random() * numbers.length)];
    pass += symbols[Math.floor(Math.random() * symbols.length)];
    
    for(let i=0; i<12; i++) {
        pass += all.charAt(Math.floor(Math.random() * all.length));
    }
    
    // Shuffle
    pass = pass.split('').sort(() => Math.random() - 0.5).join('');
    
    return pass;
  };

  const handleCreate = async () => {
    if (!newCred.label || !newCred.username || !newCred.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createCredential({
        ...newCred,
        tags: newCred.tags
      });
      setIsAddDialogOpen(false);
      setNewCred({
        label: '',
        username: '',
        password: '',
        url: '',
        notes: '',
        category: 'Application',
        tags: [],
        isFavorite: false
      });
      toast.success('Credential added successfully');
    } catch (error) {
      toast.error('Failed to create credential');
    }
  };

  const handleUpdate = async () => {
    if (!editingCred.label || !editingCred.username || !editingCred.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await updateCredential({
        id: editingCred._id,
        label: editingCred.label,
        username: editingCred.username,
        password: editingCred.password,
        url: editingCred.url,
        notes: editingCred.notes,
        category: editingCred.category,
        tags: editingCred.tags,
        isFavorite: editingCred.isFavorite
      });
      setEditingCred(null);
      toast.success('Credential updated successfully');
    } catch (error) {
      toast.error('Failed to update credential');
    }
  };

  const handleShare = async (expiresInHours: number, viewLimit?: number) => {
    try {
      const token = await createShare({
        credentialId: sharingCred._id,
        expiresInHours,
        viewLimit
      });
      const url = `${window.location.origin}/vault/share/${token}`;
      setShareLink(url);
    } catch (error) {
      toast.error('Failed to create share link');
    }
  };

  const safeFormatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'N/A';
      return format(date, 'MMM d, yyyy');
    } catch {
      return 'N/A';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Server': return <Database className="h-4 w-4" />;
      case 'Cloud': return <Globe className="h-4 w-4" />;
      case 'Social': return <Fingerprint className="h-4 w-4" />;
      case 'Application': return <Lock className="h-4 w-4" />;
      default: return <Key className="h-4 w-4" />;
    }
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Empty', color: 'bg-secondary' };
    let score = 0;
    if (pass.length > 8) score++;
    if (pass.length > 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    if (score <= 2) return { score, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { score, label: 'Medium', color: 'bg-amber-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500' };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-[0.2em]">
            <Shield className="h-4 w-4" />
            Security Center
          </div>
          <h1 className="text-5xl font-black tracking-tight text-foreground flex items-center gap-3">
            Secure Vault
            <Badge variant="outline" className="text-sm font-bold border-primary/20 text-primary bg-primary/5 rounded-full px-3">v2.0</Badge>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Enterprise-grade credential management with military-level encryption and real-time security monitoring.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Card className="flex items-center gap-4 px-5 py-3 border-none shadow-sm bg-card/40 backdrop-blur-md">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Security Score</p>
              <h4 className="text-xl font-black">{Math.round((stats.strong / Math.max(stats.total, 1)) * 100)}%</h4>
            </div>
          </Card>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-14 rounded-2xl px-8 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all font-bold text-base bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-5 w-5" /> Add Credential
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl bg-card overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/50 to-primary" />
              <DialogHeader className="p-6 pb-0">
                <DialogTitle className="text-3xl font-black tracking-tight">New Entry</DialogTitle>
                <DialogDescription className="text-base">
                  Securely store a new set of credentials in your encrypted vault.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-1.5">
                    <Label htmlFor="label" className="text-sm font-bold ml-1">Label</Label>
                    <Input 
                      id="label" 
                      value={newCred.label} 
                      onChange={e => setNewCred({...newCred, label: e.target.value})}
                      className="h-12 rounded-xl bg-secondary/50 border-none focus-visible:ring-2 focus-visible:ring-primary/20" 
                      placeholder="e.g. Production AWS Admin"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="username" className="text-sm font-bold ml-1">Username</Label>
                      <Input 
                        id="username" 
                        value={newCred.username} 
                        onChange={e => setNewCred({...newCred, username: e.target.value})}
                        className="h-12 rounded-xl bg-secondary/50 border-none focus-visible:ring-2 focus-visible:ring-primary/20" 
                        placeholder="admin@corp.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="category" className="text-sm font-bold ml-1">Category</Label>
                      <Select 
                        value={newCred.category} 
                        onValueChange={v => setNewCred({...newCred, category: v})}
                      >
                        <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-none focus-visible:ring-2 focus-visible:ring-primary/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-xl">
                          <SelectItem value="Server">Server</SelectItem>
                          <SelectItem value="Cloud">Cloud</SelectItem>
                          <SelectItem value="Application">Application</SelectItem>
                          <SelectItem value="Social">Social</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-sm font-bold ml-1">Password</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input 
                          id="password" 
                          type={showPassword['new'] ? 'text' : 'password'}
                          value={newCred.password} 
                          onChange={e => setNewCred({...newCred, password: e.target.value})}
                          className="h-12 rounded-xl bg-secondary/50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-mono" 
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg"
                          onClick={() => setShowPassword(prev => ({...prev, new: !prev.new}))}
                        >
                          {showPassword['new'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Button 
                        variant="secondary" 
                        className="h-12 rounded-xl px-4 font-bold gap-2"
                        onClick={() => {
                          const pass = generatePassword();
                          setNewCred({...newCred, password: pass});
                          setShowPassword(prev => ({...prev, new: true}));
                        }}
                      >
                        <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                        Generate
                      </Button>
                    </div>
                    {newCred.password && (
                      <div className="flex items-center gap-3 px-1">
                        <div className="flex-1 h-1.5 flex gap-1">
                          {[1, 2, 3, 4, 5].map((i) => {
                            const strength = getPasswordStrength(newCred.password);
                            return (
                              <div 
                                key={i} 
                                className={cn(
                                  "h-full flex-1 rounded-full transition-all duration-500",
                                  strength.score >= i ? strength.color : "bg-secondary"
                                )} 
                              />
                            );
                          })}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                          {getPasswordStrength(newCred.password).label}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="url" className="text-sm font-bold ml-1">URL / Access Point</Label>
                    <Input 
                      id="url" 
                      value={newCred.url} 
                      onChange={e => setNewCred({...newCred, url: e.target.value})}
                      className="h-12 rounded-xl bg-secondary/50 border-none focus-visible:ring-2 focus-visible:ring-primary/20" 
                      placeholder="https://console.aws.amazon.com"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="p-6 bg-secondary/20 flex flex-row gap-3">
                <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)} className="flex-1 rounded-xl h-12 font-bold">Cancel</Button>
                <Button onClick={handleCreate} className="flex-1 rounded-xl h-12 font-bold shadow-lg shadow-primary/20">Create Entry</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter & Stats Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-card/60 backdrop-blur-xl p-3 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by label, username, or system..."
            className="pl-12 h-14 border-none bg-transparent rounded-xl focus-visible:ring-0 text-lg font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-secondary/30 rounded-xl">
          <Button 
            variant={!showFavoritesOnly ? "secondary" : "ghost"} 
            className={cn("rounded-lg h-12 px-5 font-bold transition-all", !showFavoritesOnly && "shadow-sm")}
            onClick={() => setShowFavoritesOnly(false)}
          >
            All <Badge variant="outline" className="ml-2 border-none bg-primary/10 text-primary">{stats.total}</Badge>
          </Button>
          <Button 
            variant={showFavoritesOnly ? "secondary" : "ghost"} 
            className={cn("rounded-lg h-12 px-5 font-bold transition-all", showFavoritesOnly && "shadow-sm")}
            onClick={() => setShowFavoritesOnly(true)}
          >
            <Star className={cn("mr-2 h-4 w-4", showFavoritesOnly && "fill-amber-500 text-amber-500")} /> 
            Favorites <Badge variant="outline" className="ml-2 border-none bg-amber-500/10 text-amber-500">{stats.favorites}</Badge>
          </Button>
        </div>
      </div>

      {/* Credentials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCredentials.map((cred) => {
          const strength = getPasswordStrength(cred.password);
          return (
            <Card key={cred._id} className="group relative overflow-hidden border-border/50 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 rounded-[2rem] bg-card/40 backdrop-blur-md flex flex-col">
              {/* Card Header Actions */}
              <div className="absolute top-5 right-5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background"
                    onClick={() => toggleFavorite({ id: cred._id })}
                >
                    <Star className={cn("h-4 w-4 transition-colors", cred.isFavorite ? "fill-amber-500 text-amber-500" : "text-muted-foreground")} />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background text-muted-foreground">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2 min-w-[160px]">
                    <DropdownMenuItem className="rounded-xl h-11 px-4 flex gap-3 font-medium" onClick={() => setEditingCred(cred)}>
                        <Edit2 className="h-4 w-4 text-primary" /> Edit Entry
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl h-11 px-4 flex gap-3 font-medium" onClick={() => { setSharingCred(cred); setIsShareDialogOpen(true); setShareLink(''); }}>
                        <Share2 className="h-4 w-4 text-blue-500" /> Share Access
                    </DropdownMenuItem>
                    <div className="h-px bg-border/50 my-1 mx-2" />
                    <DropdownMenuItem className="rounded-xl h-11 px-4 flex gap-3 font-medium text-destructive focus:text-destructive" onClick={() => handleDelete(cred._id)}>
                        <Trash2 className="h-4 w-4" /> Destroy Entry
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 group-hover:rotate-3">
                    {getCategoryIcon(cred.category)}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl font-bold tracking-tight truncate max-w-[180px]">{cred.label}</CardTitle>
                      {cred.isFavorite && <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 animate-in zoom-in" />}
                    </div>
                    <CardDescription className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-70">
                        {cred.category}
                        <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                        <span className={cn("px-1.5 py-0.5 rounded-md text-[9px]", strength.color.replace('bg-', 'text-'))}>{strength.label}</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 flex-1">
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Account Identifier</Label>
                    </div>
                    <div className="group/item relative h-12 flex items-center px-4 rounded-xl bg-secondary/30 border border-transparent hover:border-primary/20 transition-all overflow-hidden">
                        <p className="text-sm font-semibold truncate flex-1">{cred.username}</p>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(cred.username, 'Username')}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            Secure Key 
                            <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", strength.color)} />
                        </Label>
                    </div>
                    <div className="group/item relative h-12 flex items-center px-4 rounded-xl bg-secondary/30 border border-transparent hover:border-primary/20 transition-all">
                        <p className="text-sm font-mono tracking-[0.3em] font-medium flex-1">
                          {showPassword[cred._id] ? cred.password : '••••••••••••'}
                        </p>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg"
                            onClick={() => togglePasswordVisibility(cred._id)}
                          >
                            {showPassword[cred._id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity"
                            onClick={() => copyToClipboard(cred.password, 'Password')}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                    </div>
                </div>

                {cred.url && (
                    <div className="pt-2">
                        <Button variant="outline" className="w-full h-11 rounded-2xl border-border/50 bg-secondary/10 hover:bg-secondary/20 hover:text-primary gap-2 transition-all font-bold text-xs" asChild>
                            <a href={cred.url.startsWith('http') ? cred.url : `https://${cred.url}`} target="_blank" rel="noopener noreferrer">
                                <Globe className="h-4 w-4" /> Launch Access Point <ExternalLink className="h-3 w-3 opacity-50 ml-auto" />
                            </a>
                        </Button>
                    </div>
                )}
              </CardContent>

              <div className="p-4 mt-auto border-t border-border/30 bg-secondary/5 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {cred.tags?.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-[9px] h-5 rounded-lg px-2 font-bold uppercase tracking-tighter opacity-70">#{tag}</Badge>
                  ))}
                  {(cred.tags?.length || 0) > 2 && <span className="text-[9px] font-bold text-muted-foreground ml-1">+{cred.tags!.length - 2}</span>}
                </div>
                <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                  <Clock className="h-3 w-3" />
                  {safeFormatDate(cred.updatedAt)}
                </div>
              </div>

              {/* Security Status Overlay */}
              {strength.label === 'Weak' && (
                  <div className="absolute top-0 left-0 w-full p-1.5 flex justify-center items-center gap-1.5 translate-y-[-100%] group-hover:translate-y-0 transition-transform bg-rose-500/10 text-rose-500 backdrop-blur-md">
                      <AlertTriangle className="h-3 w-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Security Warning: Weak Password</span>
                  </div>
              )}
            </Card>
          );
        })}

        {filteredCredentials.length === 0 && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full scale-150" />
                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center relative border border-border/50">
                    <Key className="h-12 w-12 text-muted-foreground/40" />
                </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-foreground">Vault Empty</h3>
              <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                {search ? "No matches found for your current search criteria." : "You haven't added any secure entries to your vault yet."}
              </p>
            </div>
            {!search && (
              <Button onClick={() => setIsAddDialogOpen(true)} className="h-14 px-8 rounded-2xl font-bold shadow-xl shadow-primary/20">
                <Plus className="mr-2 h-5 w-5" /> Start Securing
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Sharing Logic */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] border-none shadow-2xl overflow-hidden p-0">
          <div className="bg-gradient-to-br from-primary to-primary text-primary-foreground p-8 text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                <Share2 className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-3xl font-black">Share Access</DialogTitle>
            <DialogDescription className="text-primary-foreground/80 text-base">
                Create a temporary, trackable link for this entry.
            </DialogDescription>
          </div>
          
          <div className="p-8 space-y-6">
            {!shareLink ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold ml-1">Expiration Timeline</Label>
                  <Select value={shareExpiration} onValueChange={setShareExpiration}>
                    <SelectTrigger className="h-12 rounded-xl border-none bg-secondary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-xl">
                      <SelectItem value="1">1 Hour</SelectItem>
                      <SelectItem value="24">24 Hours</SelectItem>
                      <SelectItem value="168">7 Days</SelectItem>
                      <SelectItem value="0">Burn After Reading</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => handleShare(parseInt(shareExpiration))} className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">
                  Generate Secure Link
                </Button>
              </div>
            ) : (
              <div className="space-y-6 animate-in zoom-in duration-300">
                <div className="relative">
                    <div className="p-5 bg-secondary/50 rounded-2xl border border-dashed border-primary/20 break-all text-sm font-mono leading-relaxed pr-14">
                        {shareLink}
                    </div>
                    <Button 
                        size="icon"
                        className="absolute right-2 top-2 h-10 w-10 rounded-xl"
                        onClick={() => copyToClipboard(shareLink, 'Share link')}
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-12 rounded-xl font-bold border-border/50" onClick={() => setShareLink('')}>
                        Regenerate
                    </Button>
                    <Button variant="secondary" className="h-12 rounded-xl font-bold" onClick={() => setIsShareDialogOpen(false)}>
                        Dismiss
                    </Button>
                </div>
                
                <div className="flex items-center gap-3 justify-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    <ShieldCheck className="h-3 w-3" />
                    LINK ENCRYPTED & TRACKED
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog - Simpler implementation for demo */}
      <Dialog open={!!editingCred} onOpenChange={() => setEditingCred(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <DialogHeader className="p-8 pb-0">
                <DialogTitle className="text-3xl font-black">Edit Entry</DialogTitle>
                <DialogDescription>Modify the details of your stored credential.</DialogDescription>
            </DialogHeader>
            {editingCred && (
                <div className="p-8 space-y-5">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold ml-1 uppercase tracking-widest text-muted-foreground">Label</Label>
                            <Input 
                                value={editingCred.label} 
                                onChange={e => setEditingCred({...editingCred, label: e.target.value})}
                                className="h-12 rounded-xl bg-secondary/50 border-none px-4 font-bold"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold ml-1 uppercase tracking-widest text-muted-foreground">Username</Label>
                                <Input 
                                    value={editingCred.username} 
                                    onChange={e => setEditingCred({...editingCred, username: e.target.value})}
                                    className="h-12 rounded-xl bg-secondary/50 border-none px-4"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold ml-1 uppercase tracking-widest text-muted-foreground">Category</Label>
                                <Select value={editingCred.category} onValueChange={v => setEditingCred({...editingCred, category: v})}>
                                    <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-none px-4">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none">
                                        <SelectItem value="Server">Server</SelectItem>
                                        <SelectItem value="Cloud">Cloud</SelectItem>
                                        <SelectItem value="Application">Application</SelectItem>
                                        <SelectItem value="Social">Social</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold ml-1 uppercase tracking-widest text-muted-foreground">URL</Label>
                            <Input 
                                value={editingCred.url || ''} 
                                onChange={e => setEditingCred({...editingCred, url: e.target.value})}
                                className="h-12 rounded-xl bg-secondary/50 border-none px-4"
                            />
                        </div>
                    </div>
                </div>
            )}
            <DialogFooter className="p-6 bg-secondary/20 flex flex-row gap-3">
                <Button variant="ghost" onClick={() => setEditingCred(null)} className="flex-1 rounded-xl h-12 font-bold">Discard</Button>
                <Button onClick={handleUpdate} className="flex-1 rounded-xl h-12 font-bold bg-primary shadow-lg shadow-primary/20">Commit Changes</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
