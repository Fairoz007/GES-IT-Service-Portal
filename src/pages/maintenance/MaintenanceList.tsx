import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBackend } from '@/contexts/BackendContext';
import { cn, formatDateTime, getStatusColor } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  Wrench,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';

export function MaintenanceList() {
  const { user, hasPermission } = useAuth();
  const { preventiveMaintenance, breakdownReports, createPreventiveMaintenance, createBreakdownReport, updatePreventiveMaintenance, users } = useBackend();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isPreventiveDialogOpen, setIsPreventiveDialogOpen] = useState(false);
  const [isBreakdownDialogOpen, setIsBreakdownDialogOpen] = useState(false);
  
  // Form states
  const [preventiveForm, setPreventiveForm] = useState({
    device: '',
    location: '',
    maintenanceDate: '',
    remarks: '',
  });
  
  const [breakdownForm, setBreakdownForm] = useState({
    device: '',
    issueDescription: '',
    sparePartsUsed: '',
    repairDetails: '',
    repairCost: 0,
    technician: '',
    repairDate: '',
  });

  // Filter maintenance
  const filteredPreventive = preventiveMaintenance.filter((m) => {
    const matchesSearch = 
      m.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredBreakdown = breakdownReports.filter((r) => {
    const matchesSearch = 
      r.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.issueDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.technician.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleCreatePreventive = async () => {
    try {
      await createPreventiveMaintenance({
        device: preventiveForm.device,
        location: preventiveForm.location,
        maintenanceDate: preventiveForm.maintenanceDate,
        remarks: preventiveForm.remarks,
      });
      
      setIsPreventiveDialogOpen(false);
      setPreventiveForm({ device: '', location: '', maintenanceDate: '', remarks: '' });
    } catch (error) {
      console.error("Failed to create preventive maintenance", error);
    }
  };

  const handleCreateBreakdown = async () => {
    try {
      await createBreakdownReport({
        device: breakdownForm.device,
        issueDescription: breakdownForm.issueDescription,
        sparePartsUsed: breakdownForm.sparePartsUsed.split(',').map(s => s.trim()).filter(Boolean),
        repairDetails: breakdownForm.repairDetails,
        repairCost: breakdownForm.repairCost,
        technician: breakdownForm.technician,
        repairDate: breakdownForm.repairDate,
      });
      
      setIsBreakdownDialogOpen(false);
      setBreakdownForm({
        device: '',
        issueDescription: '',
        sparePartsUsed: '',
        repairDetails: '',
        repairCost: 0,
        technician: '',
        repairDate: '',
      });
    } catch (error) {
      console.error("Failed to create breakdown report", error);
    }
  };

  const handleCompleteMaintenance = (id: string) => {
    updatePreventiveMaintenance(id, {
      status: 'Completed',
      completedAt: new Date().toISOString(),
      technician: user?.name,
    });
  };

  const upcomingMaintenance = preventiveMaintenance.filter(m => 
    m.status === 'Scheduled' && new Date(m.maintenanceDate) > new Date()
  );

  const overdueMaintenance = preventiveMaintenance.filter(m => 
    m.status === 'Scheduled' && new Date(m.maintenanceDate) < new Date()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
          <p className="text-muted-foreground mt-1">
            Track preventive and breakdown maintenance
          </p>
        </div>
        {hasPermission('create_maintenance') && (
          <div className="flex gap-2">
            <Dialog open={isBreakdownDialogOpen} onOpenChange={setIsBreakdownDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Report Breakdown
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Report Breakdown</DialogTitle>
                  <DialogDescription>
                    Report a device breakdown or issue
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Device</Label>
                    <Input
                      placeholder="e.g., Printer - Floor 1"
                      value={breakdownForm.device}
                      onChange={(e) => setBreakdownForm({ ...breakdownForm, device: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Issue Description</Label>
                    <Textarea
                      placeholder="Describe the issue..."
                      value={breakdownForm.issueDescription}
                      onChange={(e) => setBreakdownForm({ ...breakdownForm, issueDescription: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Spare Parts Used (comma separated)</Label>
                    <Input
                      placeholder="e.g., Toner Cartridge, Paper Tray"
                      value={breakdownForm.sparePartsUsed}
                      onChange={(e) => setBreakdownForm({ ...breakdownForm, sparePartsUsed: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Repair Details</Label>
                    <Textarea
                      placeholder="Describe the repair work done..."
                      value={breakdownForm.repairDetails}
                      onChange={(e) => setBreakdownForm({ ...breakdownForm, repairDetails: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Repair Cost</Label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={breakdownForm.repairCost}
                        onChange={(e) => setBreakdownForm({ ...breakdownForm, repairCost: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Repair Date</Label>
                      <Input
                        type="date"
                        value={breakdownForm.repairDate}
                        onChange={(e) => setBreakdownForm({ ...breakdownForm, repairDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Technician</Label>
                    <Input
                      placeholder="Technician name"
                      value={breakdownForm.technician}
                      onChange={(e) => setBreakdownForm({ ...breakdownForm, technician: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsBreakdownDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateBreakdown} 
                    disabled={!breakdownForm.device || !breakdownForm.issueDescription}
                  >
                    Submit Report
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isPreventiveDialogOpen} onOpenChange={setIsPreventiveDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Maintenance
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Schedule Preventive Maintenance</DialogTitle>
                  <DialogDescription>
                    Schedule routine maintenance for equipment
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Device</Label>
                    <Input
                      placeholder="e.g., Server Room AC Unit"
                      value={preventiveForm.device}
                      onChange={(e) => setPreventiveForm({ ...preventiveForm, device: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      placeholder="e.g., Server Room A"
                      value={preventiveForm.location}
                      onChange={(e) => setPreventiveForm({ ...preventiveForm, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Maintenance Date</Label>
                    <Input
                      type="date"
                      value={preventiveForm.maintenanceDate}
                      onChange={(e) => setPreventiveForm({ ...preventiveForm, maintenanceDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Remarks</Label>
                    <Textarea
                      placeholder="Any special instructions..."
                      value={preventiveForm.remarks}
                      onChange={(e) => setPreventiveForm({ ...preventiveForm, remarks: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPreventiveDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreatePreventive} 
                    disabled={!preventiveForm.device || !preventiveForm.maintenanceDate}
                  >
                    Schedule
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Alerts */}
      {overdueMaintenance.length > 0 && (
        <Card className="border-red-500">
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-red-600">Overdue Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {overdueMaintenance.length} maintenance task(s) are overdue and require immediate attention.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {preventiveMaintenance.filter(m => m.status === 'Scheduled').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {preventiveMaintenance.filter(m => m.status === 'Completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Breakdown Reports</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{breakdownReports.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueMaintenance.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="preventive" className="space-y-4">
        <TabsList>
          <TabsTrigger value="preventive">Preventive Maintenance</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="preventive">
          <Card>
            <CardHeader>
              <CardTitle>Preventive Maintenance Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Scheduled Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead>Remarks</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPreventive.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No maintenance scheduled
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPreventive.map((maintenance) => (
                        <TableRow key={maintenance._id}>
                          <TableCell className="font-medium">{maintenance.device}</TableCell>
                          <TableCell>{maintenance.location}</TableCell>
                          <TableCell>{formatDateTime(maintenance.maintenanceDate)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(maintenance.status)}>
                              {maintenance.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{maintenance.technician || '-'}</TableCell>
                          <TableCell>{maintenance.remarks || '-'}</TableCell>
                          <TableCell>
                            {maintenance.status === 'Scheduled' && hasPermission('create_maintenance') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCompleteMaintenance(maintenance._id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Complete
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown">
          <Card>
            <CardHeader>
              <CardTitle>Breakdown Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device</TableHead>
                      <TableHead>Issue</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead>Repair Date</TableHead>
                      <TableHead>Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBreakdown.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No breakdown reports
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBreakdown.map((report) => (
                        <TableRow key={report._id}>
                          <TableCell className="font-medium">{report.device}</TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate" title={report.issueDescription}>
                              {report.issueDescription}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                          </TableCell>
                          <TableCell>{report.technician}</TableCell>
                          <TableCell>{formatDateTime(report.repairDate)}</TableCell>
                          <TableCell>${report.repairCost.toFixed(2)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
