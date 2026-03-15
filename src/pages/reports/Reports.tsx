import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBackend } from '@/contexts/BackendContext';
import { cn, formatDate, formatCurrency, exportToCSV } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  Download,
  FileText,
  TrendingUp,
  Ticket,
  Package,
  DollarSign,
  Calendar,
  Users,
  Printer,
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function Reports() {
  const { hasPermission } = useAuth();
  const { tickets, assets, procurementRequests, preventiveMaintenance, breakdownReports, getDashboardStats } = useBackend();
  const [dateRange, setDateRange] = useState('30');
  
  const stats = getDashboardStats();

  // Calculate metrics
  const totalTicketValue = tickets.length;
  const avgResolutionTime = tickets
    .filter(t => t.closedAt)
    .reduce((acc, t) => {
      const created = new Date(t.createdAt).getTime();
      const closed = new Date(t.closedAt!).getTime();
      return acc + (closed - created);
    }, 0) / (tickets.filter(t => t.closedAt).length || 1);
  
  const avgResolutionHours = Math.round(avgResolutionTime / (1000 * 60 * 60));

  const totalAssetValue = assets.length * 1000; // Estimated average value
  const totalProcurementValue = procurementRequests.reduce((sum: number, r: typeof procurementRequests[0]) => sum + r.estimatedCost, 0);
  const totalRepairCost = breakdownReports.reduce((sum, r) => sum + r.repairCost, 0);

  // Department breakdown
  const deptTickets = tickets.reduce((acc, t) => {
    acc[t.department] = (acc[t.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const deptData = Object.entries(deptTickets).map(([name, value]) => ({ name, value }));

  // Monthly trends
  const monthlyData = [
    { month: 'Jan', tickets: 45, assets: 12, procurement: 8500 },
    { month: 'Feb', tickets: 52, assets: 15, procurement: 12000 },
    { month: 'Mar', tickets: 38, assets: 10, procurement: 6500 },
    { month: 'Apr', tickets: 65, assets: 18, procurement: 15000 },
    { month: 'May', tickets: 48, assets: 14, procurement: 9800 },
    { month: 'Jun', tickets: 55, assets: 16, procurement: 11200 },
  ];

  const exportReport = (type: string) => {
    let data: Record<string, unknown>[] = [];
    let filename = '';
    
    switch (type) {
      case 'tickets':
        data = tickets.map(t => ({
          'Ticket ID': t.ticketId,
          'Subject': t.description.substring(0, 50),
          'Requester': t.userName,
          'Department': t.department,
          'Status': t.status,
          'Priority': t.priority,
          'Created': t.createdAt,
          'Closed': t.closedAt || '',
        }));
        filename = 'tickets-report.csv';
        break;
      case 'assets':
        data = assets.map(a => ({
          'Asset Code': a.assetCode,
          'Type': a.assetType,
          'Brand': a.brand,
          'Model': a.model,
          'Serial': a.serialNumber,
          'Status': a.status,
          'Assigned To': a.assignedToName || '',
          'Location': a.location,
        }));
        filename = 'assets-report.csv';
        break;
      case 'procurement':
        data = procurementRequests.map(p => ({
          'Request ID': p.requestId,
          'Item': p.itemDescription,
          'Requester': p.requester,
          'Department': p.department,
          'Quantity': p.quantity,
          'Cost': p.estimatedCost,
          'Status': p.approvalStatus,
        }));
        filename = 'procurement-report.csv';
        break;
    }
    
    exportToCSV(data, filename);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive IT operations reports and insights
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={printReport}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTicketValue}</div>
            <p className="text-xs text-muted-foreground">
              Avg resolution: {avgResolutionHours}h
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">IT Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assets.length}</div>
            <p className="text-xs text-muted-foreground">
              Est. value: {formatCurrency(totalAssetValue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Procurement</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalProcurementValue)}</div>
            <p className="text-xs text-muted-foreground">
              {procurementRequests.length} requests
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Maintenance Cost</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRepairCost)}</div>
            <p className="text-xs text-muted-foreground">
              {breakdownReports.length} repairs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>Tickets, assets, and procurement over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="tickets" stroke="#3b82f6" name="Tickets" />
                    <Line yAxisId="left" type="monotone" dataKey="assets" stroke="#10b981" name="Assets" />
                    <Line yAxisId="right" type="monotone" dataKey="procurement" stroke="#f59e0b" name="Procurement ($)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tickets by Department</CardTitle>
                <CardDescription>Distribution of tickets across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deptData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {deptData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ticket Performance</CardTitle>
                <CardDescription>Detailed ticket metrics and analysis</CardDescription>
              </div>
              <Button variant="outline" onClick={() => exportReport('tickets')}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Total Tickets</TableCell>
                      <TableCell className="font-bold">{tickets.length}</TableCell>
                      <TableCell><Badge className="bg-green-100 text-green-800">+12%</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Open Tickets</TableCell>
                      <TableCell className="font-bold">{tickets.filter(t => t.status === 'Open').length}</TableCell>
                      <TableCell><Badge variant="secondary">-5%</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Avg Resolution Time</TableCell>
                      <TableCell className="font-bold">{avgResolutionHours} hours</TableCell>
                      <TableCell><Badge className="bg-green-100 text-green-800">-8%</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>SLA Compliance</TableCell>
                      <TableCell className="font-bold">94%</TableCell>
                      <TableCell><Badge className="bg-green-100 text-green-800">+3%</Badge></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Asset Inventory</CardTitle>
                <CardDescription>Current asset status and distribution</CardDescription>
              </div>
              <Button variant="outline" onClick={() => exportReport('assets')}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-4">Assets by Type</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stats.assetsByType}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h4 className="font-medium mb-4">Assets by Status</h4>
                  <div className="space-y-2">
                    {['Available', 'Assigned', 'In Maintenance', 'Retired'].map((status) => {
                      const count = assets.filter(a => a.status === status).length;
                      const percentage = assets.length > 0 ? (count / assets.length) * 100 : 0;
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <span className="text-sm">{status}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>IT spending and cost analysis</CardDescription>
              </div>
              <Button variant="outline" onClick={() => exportReport('procurement')}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Procurement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalProcurementValue)}</div>
                    <p className="text-xs text-muted-foreground">
                      {procurementRequests.filter(r => r.approvalStatus === 'Approved').length} approved
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalRepairCost)}</div>
                    <p className="text-xs text-muted-foreground">
                      {breakdownReports.length} repairs completed
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Asset Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalAssetValue)}</div>
                    <p className="text-xs text-muted-foreground">
                      {assets.length} assets in inventory
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
