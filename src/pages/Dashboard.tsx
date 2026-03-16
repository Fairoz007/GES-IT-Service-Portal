import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import { useBackend } from '@/contexts/BackendContext';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Ticket,
  Package,
  ShoppingCart,
  Wrench,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ShieldCheck,
  Zap,
  Activity,
  ArrowRight,
  Lock,
  Eye,
  Calendar,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

const PIE_COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

function MetricCard({ title, value, icon: Icon, trend, positive, description, colorClass }: any) {
  return (
    <Card className="overflow-hidden border-none shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 bg-card/40 backdrop-blur-xl group relative">
      <div className={cn("absolute top-0 left-0 w-full h-1 opacity-20", colorClass || "bg-primary")} />
      <CardContent className="p-8">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{title}</p>
            <h3 className="text-4xl font-black tracking-tighter transition-all group-hover:scale-105 origin-left">{value}</h3>
          </div>
          <div className={cn(
            "p-4 rounded-[1.5rem] transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-inner",
            colorClass ? `${colorClass}/10 ${colorClass.replace('bg-', 'text-')}` : "bg-primary/10 text-primary"
          )}>
            <Icon className="h-7 w-7" />
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3">
          {trend && (
            <span className={cn(
              "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider",
              positive ? "text-emerald-600 bg-emerald-500/10" : "text-rose-600 bg-rose-500/10"
            )}>
              <TrendingUp className={cn("h-3 w-3", !positive && "rotate-180")} />
              {trend}
            </span>
          )}
          <span className="text-xs text-muted-foreground font-medium opacity-70">{description}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const { tickets, liveStats } = useBackend();
  const navigate = useNavigate();
  const credentials = useQuery(api.credentials.list) || [];

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10" />
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.3em]">
            <Activity className="h-4 w-4" />
            Control Center Live
          </div>
          <h1 className="text-6xl font-black tracking-tight text-foreground -ml-1">
            System <span className="text-primary">Dynamics</span>
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl font-medium leading-relaxed">
            Real-time operational intelligence and fleet management for the GES IT ecosystem.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-border/50 bg-secondary/20 hover:bg-secondary/40 font-bold transition-all border-2">
            System Status
          </Button>
          <Button onClick={() => navigate('/helpdesk/new')} className="h-14 px-8 rounded-2xl font-black shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all bg-primary hover:bg-primary/90 text-primary-foreground group text-lg">
            <Plus className="mr-2 h-6 w-6 group-hover:rotate-90 transition-transform duration-500" />
            Dispatch Ticket
          </Button>
        </div>
      </div>

      {/* Main High-Impact Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Active Incidents" 
          value={liveStats?.activeTickets ?? 0} 
          icon={Ticket} 
          trend="+12.5%" 
          positive={true}
          description="Avg. resolution 2.4h"
          colorClass="bg-blue-500"
        />
        <MetricCard 
          title="Fleet Assets" 
          value={liveStats?.assetsTracked ?? 0} 
          icon={Package} 
          trend="Live Update" 
          positive={true}
          description="Across 12 nodes"
          colorClass="bg-amber-500"
        />
        <MetricCard 
          title="Supply Pipeline" 
          value={liveStats?.pendingRequests ?? 0} 
          icon={ShoppingCart} 
          trend="-2.4%" 
          positive={false}
          description="3 mission critical"
          colorClass="bg-rose-500"
        />
        <MetricCard 
          title="Secure Entries" 
          value={credentials.length} 
          icon={ShieldCheck} 
          trend="Encrypted" 
          positive={true}
          description="AES-256 Vault-v2"
          colorClass="bg-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Advanced Revenue/Volume Chart */}
        <Card className="lg:col-span-2 border-none shadow-2xl shadow-black/5 bg-card/30 backdrop-blur-xl overflow-hidden rounded-[2.5rem]">
          <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-3xl font-black tracking-tight">Operation Velocity</CardTitle>
              <CardDescription className="text-base font-medium">Monthly volume of service transmissions.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge className="rounded-full bg-emerald-500/10 text-emerald-500 border-none font-black px-4 py-1 animate-pulse">
                REAL-TIME DATA
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-8">
            <div className="h-[400px] w-full mt-6">
               <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={liveStats?.monthlyRequests?.length ? liveStats.monthlyRequests : [
                  { month: 'Jan', tickets: 45, load: 30 }, { month: 'Feb', tickets: 52, load: 45 }, { month: 'Mar', tickets: 38, load: 32 },
                  { month: 'Apr', tickets: 65, load: 55 }, { month: 'May', tickets: 48, load: 40 }, { month: 'Jun', tickets: 55, load: 50 },
                  { month: 'Jul', tickets: 72, load: 60 }
                ]}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="loadGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 13, fill: '#888', fontWeight: 600 }} 
                    dy={15}
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }}
                    contentStyle={{ 
                        borderRadius: '24px', 
                        border: 'none', 
                        boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                        padding: '16px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="tickets" 
                    stroke="#3b82f6" 
                    strokeWidth={4} 
                    fill="url(#areaGradient)" 
                    animationDuration={2000}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="load" 
                    stroke="#8b5cf6" 
                    strokeWidth={4} 
                    fill="url(#loadGradient)" 
                    animationDuration={2500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Security / Health Status */}
        <Card className="border-none shadow-2xl shadow-black/5 bg-card/30 backdrop-blur-xl overflow-hidden rounded-[2.5rem]">
          <CardHeader className="p-8">
            <CardTitle className="text-3xl font-black tracking-tight">Node Health</CardTitle>
            <CardDescription className="text-base font-medium">Global system availability metrics.</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8 space-y-8">
            <div className="h-[240px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Healthy', value: 85 },
                      { name: 'Warning', value: 10 },
                      { name: 'Critical', value: 5 },
                    ]}
                    innerRadius={80}
                    outerRadius={105}
                    paddingAngle={10}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" stroke="none" />
                    <Cell fill="#f59e0b" stroke="none" />
                    <Cell fill="#ef4444" stroke="none" />
                  </Pie>
                  <Tooltip 
                     contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black tracking-tighter">99.8%</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">UPTIME</span>
              </div>
            </div>
            
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/20 border border-border/50 group hover:border-primary/30 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-black tracking-tight">Main Gateway</p>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Optimal Performance</p>
                    </div>
                </div>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/20 border border-border/50 group hover:border-amber-500/30 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                        <Zap className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-black tracking-tight">Backup Cluster</p>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Sync in Progress (92%)</p>
                    </div>
                </div>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stream Activity - Full Width Design */}
      <Card className="border-none shadow-2xl shadow-black/5 bg-card/30 backdrop-blur-xl rounded-[3rem] overflow-hidden">
        <CardHeader className="p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <CardTitle className="text-4xl font-black tracking-tight">Transmission Stream</CardTitle>
            <CardDescription className="text-lg font-medium opacity-70">Unified ledger of all system-wide orchestrations.</CardDescription>
          </div>
          <div className="flex gap-4">
               <div className="flex -space-x-3 overflow-hidden p-1">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="inline-block h-10 w-10 rounded-full ring-4 ring-card bg-secondary/80 border border-border/50 flex items-center justify-center font-black text-[10px]">
                            U{i}
                        </div>
                    ))}
                    <div className="flex items-center justify-center h-10 w-10 rounded-full ring-4 ring-card bg-primary text-primary-foreground font-black text-[10px]">
                        +12
                    </div>
               </div>
               <Button variant="ghost" className="h-12 px-6 rounded-xl text-primary font-black hover:bg-primary/5 transition-all group">
                Access Audit Logs <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
          </div>
        </CardHeader>
        <CardContent className="px-10 pb-10">
          <div className="grid grid-cols-1 gap-4">
            {tickets.slice(0, 5).map((ticket, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-6 rounded-[2rem] bg-secondary/10 hover:bg-secondary/20 transition-all duration-500 border border-transparent hover:border-primary/20 group cursor-pointer relative overflow-hidden"
                onClick={() => navigate(`/helpdesk/${ticket._id}`)}
              >
                <div className="flex items-center gap-6 relative z-10">
                   <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all group-hover:scale-110 group-hover:rotate-3",
                    ticket.priority === 'Critical' ? "bg-rose-500 text-white shadow-rose-500/20" : "bg-blue-500 text-white shadow-blue-500/20"
                  )}>
                    <Ticket className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-[10px] font-black border-primary/20 bg-primary/5 text-primary tracking-[0.1em]">#{ticket.ticketId}</Badge>
                        <span className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1.5 px-1 tracking-wider">
                            <Calendar className="h-3 w-3" /> {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    <h4 className="font-black text-xl group-hover:text-primary transition-colors tracking-tight">{ticket.description}</h4>
                    <p className="text-xs text-muted-foreground font-extrabold uppercase tracking-[0.1em] opacity-60">
                        {ticket.category} — {ticket.department}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-10 relative z-10">
                  <div className="hidden lg:flex flex-col items-end gap-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Incident Priority</p>
                    <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", ticket.priority === 'Critical' ? "bg-rose-500 animate-pulse" : "bg-blue-400")} />
                        <span className={cn("font-black text-xs uppercase tracking-wider", ticket.priority === 'Critical' ? "text-rose-500" : "text-blue-500")}>
                            {ticket.priority}
                        </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                      <Badge className={cn(
                        "rounded-xl px-4 py-2 font-black text-[10px] uppercase tracking-[0.2em] shadow-lg",
                        ticket.status === 'Open' ? "bg-primary text-white shadow-primary/20" : "bg-slate-500 text-white shadow-slate-500/20"
                      )}>
                        {ticket.status}
                      </Badge>
                      <Button variant="ghost" size="icon" className="rounded-full bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                  </div>
                </div>
                
                {/* Visual Accent */}
                <div className={cn(
                    "absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-[60px] opacity-0 group-hover:opacity-10 transition-opacity duration-700",
                    ticket.priority === 'Critical' ? "bg-rose-500" : "bg-blue-500"
                )} />
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-center">
                <Button variant="outline" className="h-12 px-10 rounded-2xl border-2 font-black tracking-tight hover:bg-secondary transition-all" onClick={() => navigate('/helpdesk')}>
                    View Full Transmission Log
                </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
