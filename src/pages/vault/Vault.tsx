import React, { useState } from 'react';
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
  Share2
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  
  const credentials = useQuery(api.credentials.list);
  const createCredential = useMutation(api.credentials.create);
  const updateCredential = useMutation(api.credentials.update);
  const deleteCredential = useMutation(api.credentials.remove);
  const createShare = useMutation(api.shares.create);

  const [editingCred, setEditingCred] = useState<any>(null);
  const [sharingCred, setSharingCred] = useState<any>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [shareExpiration, setShareExpiration] = useState('24');
  
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

  const filteredCredentials = (credentials || []).filter(c => 
    (c?.label || '').toLowerCase().includes(search.toLowerCase()) || 
    (c?.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (c?.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const togglePassword = (id: string) => {
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
    tags: [] as string[]
  });

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
        tags: []
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
        tags: editingCred.tags
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
      case 'Social': return <ShieldCheck className="h-4 w-4" />;
      case 'Application': return <Lock className="h-4 w-4" />;
      default: return <Key className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 tracking-tight">
            Security Vault
          </h1>
          <p className="text-muted-foreground mt-1">Manage and access your encrypted credentials securely.</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl px-6 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
              <Plus className="mr-2 h-4 w-4" /> Add Credential
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Add New Credential</DialogTitle>
              <DialogDescription>
                Fill in the details for your new secure entry.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="label" className="text-right">Label*</Label>
                <Input 
                  id="label" 
                  value={newCred.label} 
                  onChange={e => setNewCred({...newCred, label: e.target.value})}
                  className="col-span-3 rounded-xl" 
                  placeholder="e.g. AWS Root Account"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">Username*</Label>
                <Input 
                  id="username" 
                  value={newCred.username} 
                  onChange={e => setNewCred({...newCred, username: e.target.value})}
                  className="col-span-3 rounded-xl" 
                  placeholder="admin@example.com"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">Password*</Label>
                <div className="col-span-3 space-y-2">
                  <div className="flex gap-2">
                    <Input 
                      id="password" 
                      type={showPassword['new'] ? 'text' : 'password'}
                      value={newCred.password} 
                      onChange={e => setNewCred({...newCred, password: e.target.value})}
                      className="rounded-xl" 
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-xl flex-shrink-0"
                      onClick={() => {
                        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
                        let pass = "";
                        for(let i=0; i<16; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
                        setNewCred({...newCred, password: pass});
                        setShowPassword(prev => ({...prev, new: true}));
                      }}
                      title="Generate Strong Password"
                    >
                      <ShieldCheck className="h-4 w-4 text-primary" />
                    </Button>
                  </div>
                  {newCred.password && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div 
                            key={i} 
                            className={cn(
                              "h-1 flex-1 rounded-full bg-secondary",
                              newCred.password.length > i * 3 && "bg-primary"
                            )} 
                          />
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                        {newCred.password.length < 8 ? 'Weak' : newCred.password.length < 12 ? 'Medium' : 'Strong'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="url" className="text-right">URL</Label>
                <Input 
                  id="url" 
                  value={newCred.url} 
                  onChange={e => setNewCred({...newCred, url: e.target.value})}
                  className="col-span-3 rounded-xl" 
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category</Label>
                <Select 
                  value={newCred.category} 
                  onValueChange={v => setNewCred({...newCred, category: v})}
                >
                  <SelectTrigger className="col-span-3 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Server">Server</SelectItem>
                    <SelectItem value="Cloud">Cloud</SelectItem>
                    <SelectItem value="Application">Application</SelectItem>
                    <SelectItem value="Social">Social</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="notes" className="text-right mt-2">Notes</Label>
                <Textarea 
                  id="notes" 
                  value={newCred.notes} 
                  onChange={e => setNewCred({...newCred, notes: e.target.value})}
                  className="col-span-3 rounded-xl" 
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={handleCreate} className="rounded-xl">Save Credential</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingCred} onOpenChange={() => setEditingCred(null)}>
          <DialogContent className="sm:max-w-[500px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Edit Credential</DialogTitle>
              <DialogDescription>
                Update the details for this secure entry.
              </DialogDescription>
            </DialogHeader>
            {editingCred && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-label" className="text-right">Label*</Label>
                  <Input 
                    id="edit-label" 
                    value={editingCred.label} 
                    onChange={e => setEditingCred({...editingCred, label: e.target.value})}
                    className="col-span-3 rounded-xl" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-username" className="text-right">Username*</Label>
                  <Input 
                    id="edit-username" 
                    value={editingCred.username} 
                    onChange={e => setEditingCred({...editingCred, username: e.target.value})}
                    className="col-span-3 rounded-xl" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-password" className="text-right">Password*</Label>
                  <div className="col-span-3 flex gap-2">
                    <Input 
                      id="edit-password" 
                      type={showPassword['edit'] ? 'text' : 'password'}
                      value={editingCred.password} 
                      onChange={e => setEditingCred({...editingCred, password: e.target.value})}
                      className="rounded-xl" 
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-xl flex-shrink-0"
                      onClick={() => setShowPassword(prev => ({...prev, edit: !prev.edit}))}
                    >
                      {showPassword['edit'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-url" className="text-right">URL</Label>
                  <Input 
                    id="edit-url" 
                    value={editingCred.url || ''} 
                    onChange={e => setEditingCred({...editingCred, url: e.target.value})}
                    className="col-span-3 rounded-xl" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-category" className="text-right">Category</Label>
                  <Select 
                    value={editingCred.category} 
                    onValueChange={v => setEditingCred({...editingCred, category: v})}
                  >
                    <SelectTrigger className="col-span-3 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Server">Server</SelectItem>
                      <SelectItem value="Cloud">Cloud</SelectItem>
                      <SelectItem value="Application">Application</SelectItem>
                      <SelectItem value="Social">Social</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="edit-notes" className="text-right mt-2">Notes</Label>
                  <Textarea 
                    id="edit-notes" 
                    value={editingCred.notes || ''} 
                    onChange={e => setEditingCred({...editingCred, notes: e.target.value})}
                    className="col-span-3 rounded-xl" 
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingCred(null)} className="rounded-xl">Cancel</Button>
              <Button onClick={handleUpdate} className="rounded-xl">Update Credential</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogContent className="sm:max-w-[500px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Share Credential</DialogTitle>
              <DialogDescription>
                Generate a secure, temporary link to share this password.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {!shareLink ? (
                <div className="grid gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>Expiration</Label>
                    <Select value={shareExpiration} onValueChange={setShareExpiration}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="1">1 Hour</SelectItem>
                        <SelectItem value="24">24 Hours</SelectItem>
                        <SelectItem value="168">7 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={() => handleShare(parseInt(shareExpiration))} className="w-full rounded-xl">
                    Generate Share Link
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-secondary/50 rounded-xl border border-border/50 break-all text-sm font-mono">
                    {shareLink}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 rounded-xl" 
                      onClick={() => copyToClipboard(shareLink, 'Share link')}
                    >
                      <Copy className="mr-2 h-4 w-4" /> Copy Link
                    </Button>
                    <Button 
                      variant="outline" 
                      className="rounded-xl" 
                      onClick={() => setShareLink('')}
                    >
                      New Link
                    </Button>
                  </div>
                  <p className="text-[10px] text-center text-muted-foreground uppercase font-bold tracking-widest">
                    This link will expire in 24 hours
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search credentials by name, username or category..."
            className="pl-10 h-11 border-none bg-secondary/50 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Badge variant="outline" className="h-11 px-4 rounded-xl flex gap-2 items-center text-sm font-medium border-border/50 bg-secondary/30">
            <Lock className="h-3.5 w-3.5" /> {(credentials || []).length} Total
          </Badge>
          <Badge variant="outline" className="h-11 px-4 rounded-xl flex gap-2 items-center text-sm font-medium border-border/50 bg-secondary/30">
            <ShieldCheck className="h-3.5 w-3.5" /> Encrypted
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCredentials.map((cred) => (
          <Card key={cred._id} className="group relative overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 rounded-3xl bg-card/50 backdrop-blur-sm">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem 
                    className="flex gap-2"
                    onClick={() => setEditingCred(cred)}
                  >
                    <Edit2 className="h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex gap-2"
                    onClick={() => {
                      setSharingCred(cred);
                      setIsShareDialogOpen(true);
                      setShareLink('');
                    }}
                  >
                    <Share2 className="h-4 w-4" /> Share link
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex gap-2 text-destructive focus:text-destructive"
                    onClick={() => handleDelete(cred._id)}
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <CardHeader className="pb-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  {getCategoryIcon(cred.category)}
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">{cred.label}</CardTitle>
                  <CardDescription className="text-xs">{cred.category}</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-secondary/40 border border-border/20 group/item">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Username</Label>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(cred.username, 'Username')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm font-medium truncate">{cred.username}</p>
                </div>

                <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-secondary/40 border border-border/20 group/item">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Password</Label>
                    <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 rounded-lg"
                        onClick={() => togglePassword(cred._id)}
                      >
                        {showPassword[cred._id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 rounded-lg"
                        onClick={() => copyToClipboard(cred.password, 'Password')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm font-mono tracking-wider">
                    {showPassword[cred._id] ? cred.password : '••••••••••••'}
                  </p>
                </div>
              </div>

              {cred.url && (
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Globe className="h-3 w-3" />
                    <span className="truncate max-w-[150px]">{cred.url}</span>
                  </div>
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-xs flex gap-1 items-center"
                    asChild
                  >
                    <a href={cred.url} target="_blank" rel="noopener noreferrer">
                      Open <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border/30">
                <div className="flex gap-1">
                  {cred.tags?.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-[9px] h-4 rounded-lg">{tag}</Badge>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                  <Clock className="h-3 w-3" />
                  {safeFormatDate(cred.updatedAt)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredCredentials.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center">
              <Key className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <div>
              <h3 className="text-xl font-bold">No credentials found</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                {search ? "No results match your search criteria." : "Start by adding your first secure credential to the vault."}
              </p>
            </div>
            {!search && (
              <Button onClick={() => setIsAddDialogOpen(true)} className="rounded-xl">
                <Plus className="mr-2 h-4 w-4" /> Add your first entry
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
