import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBackend } from '@/contexts/BackendContext';
import { cn, formatDateTime, getStatusColor, formatMACAddress, isValidMACAddress } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Wifi,
  CheckCircle,
  XCircle,
  Eye,
  Monitor,
  Smartphone,
  Laptop,
} from 'lucide-react';

export function NetworkAccessList() {
  const { user, hasPermission } = useAuth();
  const { networkAccessRequests, createNetworkAccessRequest, approveNetworkAccess, rejectNetworkAccess } = useBackend();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // New request form state
  const [newRequest, setNewRequest] = useState({
    deviceType: '',
    macAddress: '',
    deviceOwnership: 'Company' as 'Company' | 'Personal',
    internetType: 'Wireless' as 'Wired' | 'Wireless',
    accessLevel: 'Limited' as 'Limited' | 'Corporate' | 'Unlimited',
    reason: '',
  });

  // Filter requests
  const filteredRequests = networkAccessRequests.filter((request) => {
    const matchesSearch = 
      request.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.deviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.macAddress.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Employees see their own requests
    if (user?.role === 'Employee') {
      return matchesSearch && request.userId === user.id;
    }
    
    return matchesSearch;
  });

  const handleCreateRequest = async () => {
    if (!user) return;
    
    try {
      await createNetworkAccessRequest({
        userId: user.id,
        userName: user.name,
        department: user.department,
        deviceType: newRequest.deviceType,
        macAddress: formatMACAddress(newRequest.macAddress),
        deviceOwnership: newRequest.deviceOwnership,
        internetType: newRequest.internetType,
        accessLevel: newRequest.accessLevel,
        reason: newRequest.reason,
      });
      
      setIsCreateDialogOpen(false);
      setNewRequest({
        deviceType: '',
        macAddress: '',
        deviceOwnership: 'Company',
        internetType: 'Wireless',
        accessLevel: 'Limited',
        reason: '',
      });
    } catch (error) {
      console.error("Failed to create network access request", error);
    }
  };

  const handleApprove = (requestId: string) => {
    if (!user) return;
    approveNetworkAccess(requestId, user.name);
  };

  const handleReject = (requestId: string) => {
    if (!user) return;
    rejectNetworkAccess(requestId, user.name);
  };

  const getDeviceIcon = (deviceType: string) => {
    const type = deviceType.toLowerCase();
    if (type.includes('phone') || type.includes('mobile')) return <Smartphone className="h-4 w-4" />;
    if (type.includes('laptop')) return <Laptop className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const macAddressValid = isValidMACAddress(newRequest.macAddress);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Network Access</h1>
          <p className="text-muted-foreground mt-1">
            Manage network and internet access requests
          </p>
        </div>
        {hasPermission('view_network_access') && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Request Network Access</DialogTitle>
                <DialogDescription>
                  Request internet access for your device
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Device Type</Label>
                  <Input
                    placeholder="e.g., MacBook Pro, iPhone 15"
                    value={newRequest.deviceType}
                    onChange={(e) => setNewRequest({ ...newRequest, deviceType: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>MAC Address</Label>
                  <Input
                    placeholder="AA:BB:CC:DD:EE:FF"
                    value={newRequest.macAddress}
                    onChange={(e) => setNewRequest({ ...newRequest, macAddress: e.target.value })}
                    className={cn(!macAddressValid && newRequest.macAddress && 'border-red-500')}
                  />
                  {!macAddressValid && newRequest.macAddress && (
                    <p className="text-xs text-red-500">Invalid MAC address format</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Device Ownership</Label>
                    <Select
                      value={newRequest.deviceOwnership}
                      onValueChange={(v) => setNewRequest({ ...newRequest, deviceOwnership: v as 'Company' | 'Personal' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Company">Company</SelectItem>
                        <SelectItem value="Personal">Personal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Internet Type</Label>
                    <Select
                      value={newRequest.internetType}
                      onValueChange={(v) => setNewRequest({ ...newRequest, internetType: v as 'Wired' | 'Wireless' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Wired">Wired</SelectItem>
                        <SelectItem value="Wireless">Wireless</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Access Level</Label>
                  <Select
                    value={newRequest.accessLevel}
                    onValueChange={(v) => setNewRequest({ ...newRequest, accessLevel: v as 'Limited' | 'Corporate' | 'Unlimited' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Limited">Limited (Internet Only)</SelectItem>
                      <SelectItem value="Corporate">Corporate (Internal Resources)</SelectItem>
                      <SelectItem value="Unlimited">Unlimited (Full Access)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Input
                    placeholder="Why do you need network access?"
                    value={newRequest.reason}
                    onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateRequest} 
                  disabled={!newRequest.deviceType || !newRequest.macAddress || !macAddressValid || !newRequest.reason}
                >
                  Submit Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkAccessRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <div className="h-4 w-4 rounded-full bg-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {networkAccessRequests.filter(r => r.status === 'Pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {networkAccessRequests.filter(r => r.status === 'Approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {networkAccessRequests.filter(r => r.status === 'Rejected').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Network Access Requests ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>MAC Address</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Access Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="w-[150px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.requestId}>
                      <TableCell className="font-medium">{request.requestId}</TableCell>
                      <TableCell>{request.userName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(request.deviceType)}
                          {request.deviceType}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{request.macAddress}</TableCell>
                      <TableCell>{request.internetType}</TableCell>
                      <TableCell>{request.accessLevel}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                      </TableCell>
                      <TableCell>{formatDateTime(request.requestedAt)}</TableCell>
                      <TableCell>
                        {request.status === 'Pending' && hasPermission('approve_network_access') && (
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600"
                              onClick={() => handleApprove(request.requestId)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => handleReject(request.requestId)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
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
    </div>
  );
}
