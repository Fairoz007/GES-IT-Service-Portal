import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import { useBackend } from '@/contexts/BackendContext';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const PIE_COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

function MetricCard({ title, value, icon: Icon, trend, positive, description }: any) {
  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
            <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
          </div>
          <div className="p-3 bg-primary/5 rounded-2xl group-hover:bg-primary/10 transition-colors">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          {trend && (
            <span className={cn(
              "flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-full",
              positive ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
            )}>
              {trend}
              <ArrowUpRight className={cn("h-3 w-3", !positive && "rotate-90")} />
            </span>
          )}
          <span className="text-xs text-muted-foreground">{description}</span>
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
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight">System Dynamics</h1>
          <p className="text-muted-foreground text-lg">Central hub for GES IT operations and service assets.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 px-6 rounded-xl border-border/50 hover:bg-secondary/50 font-semibold transition-all">
            Export Report
          </Button>
          <Button onClick={() => navigate('/helpdesk/new')} className="h-11 px-6 rounded-xl font-bold shadow-lg shadow-primary/20 hover:translate-y-[-2px] transition-all">
            <Plus className="mr-2 h-5 w-5" />
            Create Ticket
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Active Tickets" 
          value={liveStats?.activeTickets ?? 0} 
          icon={Ticket} 
          trend="+12%" 
          positive={true}
          description="Avg. 2.4h resolution"
        />
        <MetricCard 
          title="Assets Tracked" 
          value={liveStats?.assetsTracked ?? 0} 
          icon={Package} 
          trend="8 new" 
          positive={true}
          description="In 12 locations"
        />
        <MetricCard 
          title="Pending Requests" 
          value={liveStats?.pendingRequests ?? 0} 
          icon={ShoppingCart} 
          trend="-2%" 
          positive={false}
          description="3 critical priority"
        />
        <MetricCard 
          title="Security Vault" 
          value={credentials.length} 
          icon={ShieldCheck} 
          trend="Secure" 
          positive={true}
          description="AES-256 Encrypted"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Traffic / Line Chart Placeholder */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl font-bold">Operational Trends</CardTitle>
              <p className="text-sm text-muted-foreground">Monthly volume of tickets and requests.</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="rounded-md border-primary/20 text-primary">Live</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full mt-4">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={liveStats?.monthlyRequests?.length ? liveStats.monthlyRequests : [
                  { month: 'Jan', tickets: 45 }, { month: 'Feb', tickets: 52 }, { month: 'Mar', tickets: 38 },
                  { month: 'Apr', tickets: 65 }, { month: 'May', tickets: 48 }, { month: 'Jun', tickets: 55 }
                ]}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                  <Tooltip 
                    cursor={{fill: 'rgba(59, 130, 246, 0.05)'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  />
                  <Bar dataKey="tickets" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Ticket Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">Status breakdown across departments.</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Hardware', value: 35 },
                      { name: 'Software', value: 25 },
                      { name: 'Network', value: 20 },
                      { name: 'Access', value: 15 },
                      { name: 'Other', value: 5 },
                    ]}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {[0, 1, 2, 3, 4].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Resolved</span>
                <span className="font-bold">84%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4 text-amber-500" /> Average Wait</span>
                <span className="font-bold">12m</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Stream Activity</CardTitle>
            <p className="text-sm text-muted-foreground">Real-time update stream from across the portal.</p>
          </div>
          <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5 rounded-xl transition-all">
            See all activity
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tickets.slice(0, 5).map((ticket, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-secondary/40 transition-all border border-transparent hover:border-border/50 group cursor-pointer">
                <div className="flex items-center gap-4">
                   <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ring-2 ring-background",
                    ticket.priority === 'Critical' ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"
                  )}>
                    {ticket.ticketId.split('-')[1]}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{ticket.description}</h4>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-0.5">{ticket.userName} • {ticket.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden md:flex flex-col items-end">
                    <p className="text-xs font-bold uppercase tracking-tighter">Priority</p>
                    <Badge variant="outline" className={cn(
                      "mt-0.5 font-bold h-5 px-1 border-none",
                      ticket.priority === 'Critical' ? "text-rose-500" : "text-amber-500"
                    )}>{ticket.priority}</Badge>
                  </div>
                  <Badge className={cn(
                    "rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-widest",
                    ticket.status === 'Open' ? "bg-blue-500" : "bg-slate-500"
                  )}>{ticket.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
