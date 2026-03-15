import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBackend } from '@/contexts/BackendContext';
import { cn, formatCurrency, formatDateTime, getStatusColor } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  ShoppingCart,
  User,
  DollarSign,
  Clock,
} from 'lucide-react';

export function ProcurementList() {
  const { user, hasPermission, hasRole } = useAuth();
  const { procurementRequests, createProcurementRequest, approveProcurement, users } = useBackend();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [approvalComments, setApprovalComments] = useState('');
  
  // New request form state
  const [newRequest, setNewRequest] = useState({
    itemDescription: '',
    quantity: 1,
    justification: '',
    estimatedCost: 0,
    supplier: '',
  });

  // Filter requests
  const filteredRequests = procurementRequests.filter((request) => {
    const matchesSearch = 
      request.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.itemDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.requester.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Employees see their own requests, others see all
    if (user?.role === 'Employee') {
      return matchesSearch && request.requesterId === user.id;
    }
    
    return matchesSearch;
  });

  const handleCreateRequest = async () => {
    if (!user) return;
    
    try {
      const result = await createProcurementRequest({
        requester: user.name,
        requesterId: user.id,
        department: user.department,
        itemDescription: newRequest.itemDescription,
        quantity: newRequest.quantity,
        justification: newRequest.justification,
        estimatedCost: newRequest.estimatedCost,
        supplier: newRequest.supplier,
      });
      
      setIsCreateDialogOpen(false);
      setNewRequest({
        itemDescription: '',
        quantity: 1,
        justification: '',
        estimatedCost: 0,
        supplier: '',
      });
      
      if (result && result.requestId) {
        navigate(`/procurement/${result.requestId}`);
      }
    } catch (error) {
      console.error("Failed to create procurement request", error);
    }
  };

  const handleApprove = () => {
    if (!selectedRequest || !user) return;
    
    const request = procurementRequests.find(r => r.requestId === selectedRequest);
    if (!request) return;

    // Determine which approval step
    let approvalRole = '';
    if (request.approvalStatus === 'Pending Department Head' && hasRole(['Department Head', 'Admin'])) {
      approvalRole = 'Department Head';
    } else if (request.approvalStatus === 'Pending IT Head' && hasRole(['IT Staff', 'Admin'])) {
      approvalRole = 'IT Head';
    } else if (request.approvalStatus === 'Pending Management' && hasRole(['Admin'])) {
      approvalRole = 'Management';
    }

    if (approvalRole) {
      approveProcurement(selectedRequest, user.name, approvalRole, approvalComments);
    }

    setIsApproveDialogOpen(false);
    setSelectedRequest(null);
    setApprovalComments('');
  };

  const canApprove = (request: typeof procurementRequests[0]) => {
    if (request.approvalStatus === 'Pending Department Head' && hasRole(['Department Head', 'Admin'])) {
      return true;
    }
    if (request.approvalStatus === 'Pending IT Head' && hasRole(['IT Staff', 'Admin'])) {
      return true;
    }
    if (request.approvalStatus === 'Pending Management' && hasRole(['Admin'])) {
      return true;
    }
    return false;
  };

  const getApprovalProgress = (request: typeof procurementRequests[0]) => {
    const completed = request.approvals.filter(a => a.status === 'Approved').length;
    return (completed / request.approvals.length) * 100;
  };

  const totalPendingValue = procurementRequests
    .filter(r => r.approvalStatus.includes('Pending'))
    .reduce((sum, r) => sum + r.estimatedCost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Procurement</h1>
          <p className="text-muted-foreground mt-1">
            Manage IT equipment procurement requests
          </p>
        </div>
        {hasPermission('create_procurement') && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>New Procurement Request</DialogTitle>
                <DialogDescription>
                  Request new IT equipment for your department
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Item Description</Label>
                  <Input
                    placeholder="e.g., Dell Latitude 5520 Laptop"
                    value={newRequest.itemDescription}
                    onChange={(e) => setNewRequest({ ...newRequest, itemDescription: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min={1}
                      value={newRequest.quantity}
                      onChange={(e) => setNewRequest({ ...newRequest, quantity: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estimated Cost</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={newRequest.estimatedCost}
                      onChange={(e) => setNewRequest({ ...newRequest, estimatedCost: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Supplier (Optional)</Label>
                  <Input
                    placeholder="e.g., Dell Direct"
                    value={newRequest.supplier}
                    onChange={(e) => setNewRequest({ ...newRequest, supplier: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Justification</Label>
                  <Textarea
                    placeholder="Explain why this purchase is needed..."
                    value={newRequest.justification}
                    onChange={(e) => setNewRequest({ ...newRequest, justification: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateRequest} 
                  disabled={!newRequest.itemDescription || !newRequest.justification}
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
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{procurementRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {procurementRequests.filter(r => r.approvalStatus.includes('Pending')).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {procurementRequests.filter(r => r.approvalStatus === 'Approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPendingValue)}</div>
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
          <CardTitle>Procurement Requests ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Item Description</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Est. Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
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
                    <TableRow
                      key={request.requestId}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/procurement/${request.requestId}`)}
                    >
                      <TableCell className="font-medium">{request.requestId}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate" title={request.itemDescription}>
                          {request.itemDescription}
                        </div>
                      </TableCell>
                      <TableCell>{request.requester}</TableCell>
                      <TableCell>{request.quantity}</TableCell>
                      <TableCell>{formatCurrency(request.estimatedCost)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(request.approvalStatus)}>
                          {request.approvalStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="w-full max-w-[100px]">
                          <Progress value={getApprovalProgress(request)} className="h-2" />
                          <span className="text-xs text-muted-foreground">
                            {request.approvals.filter(a => a.status === 'Approved').length}/{request.approvals.length}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDateTime(request.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/procurement/${request.requestId}`);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canApprove(request) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRequest(request.requestId);
                                setIsApproveDialogOpen(true);
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this procurement request?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Comments (Optional)</Label>
              <Textarea
                placeholder="Add any comments..."
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
