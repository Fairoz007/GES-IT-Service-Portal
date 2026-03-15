import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBackend } from '@/contexts/BackendContext';
import { cn, formatDateTime, getStatusColor } from '@/lib/utils';
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
import { Textarea } from '@/components/ui/textarea';
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
  Globe,
  CheckCircle,
  XCircle,
  Eye,
  Code,
  FileEdit,
  Rocket,
} from 'lucide-react';
import type { ChangeType, TicketPriority } from '@/types';

export function WebsiteRequestList() {
  const { user, hasPermission } = useAuth();
  const { websiteChangeRequests, createWebsiteChangeRequest, updateWebsiteChangeRequest } = useBackend();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // New request form state
  const [newRequest, setNewRequest] = useState({
    applicationName: '',
    changeType: 'New Content' as ChangeType,
    changeDescription: '',
    priority: 'Medium' as TicketPriority,
    impactedSystems: '',
    requestedGoLiveDate: '',
  });

  // Filter requests
  const filteredRequests = websiteChangeRequests.filter((request) => {
    const matchesSearch = 
      request.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.applicationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.changeDescription.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Employees see their own requests
    if (user?.role === 'Employee') {
      return matchesSearch && request.requesterId === user.id;
    }
    
    return matchesSearch;
  });

  const handleCreateRequest = async () => {
    if (!user) return;
    
    try {
      await createWebsiteChangeRequest({
        applicationName: newRequest.applicationName,
        requester: user.name,
        requesterId: user.id,
        department: user.department,
        changeType: newRequest.changeType,
        changeDescription: newRequest.changeDescription,
        priority: newRequest.priority,
        impactedSystems: newRequest.impactedSystems.split(',').map(s => s.trim()).filter(Boolean),
        requestedGoLiveDate: newRequest.requestedGoLiveDate,
      });
      
      setIsCreateDialogOpen(false);
      setNewRequest({
        applicationName: '',
        changeType: 'New Content',
        changeDescription: '',
        priority: 'Medium',
        impactedSystems: '',
        requestedGoLiveDate: '',
      });
    } catch (error) {
      console.error("Failed to create website change request", error);
    }
  };

  const handleApprove = (requestId: string) => {
    if (!user) return;
    updateWebsiteChangeRequest(requestId, {
      status: 'Approved',
      approval: user.name,
    });
  };

  const handleDeploy = (requestId: string) => {
    updateWebsiteChangeRequest(requestId, {
      status: 'Deployed',
      deploymentDate: new Date().toISOString(),
    });
  };

  const getChangeTypeIcon = (type: ChangeType) => {
    switch (type) {
      case 'New Content': return <FileEdit className="h-4 w-4" />;
      case 'Edit Content': return <Code className="h-4 w-4" />;
      case 'Bug Fix': return <CheckCircle className="h-4 w-4" />;
      case 'Feature Enhancement': return <Rocket className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Website Change Requests</h1>
          <p className="text-muted-foreground mt-1">
            Manage RFCs for website and application changes
          </p>
        </div>
        {hasPermission('create_website_request') && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New RFC
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>New Change Request (RFC)</DialogTitle>
                <DialogDescription>
                  Request a change to a website or application
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Application/Website Name</Label>
                  <Input
                    placeholder="e.g., Company Website"
                    value={newRequest.applicationName}
                    onChange={(e) => setNewRequest({ ...newRequest, applicationName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Change Type</Label>
                    <Select
                      value={newRequest.changeType}
                      onValueChange={(v) => setNewRequest({ ...newRequest, changeType: v as ChangeType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New Content">New Content</SelectItem>
                        <SelectItem value="Edit Content">Edit Content</SelectItem>
                        <SelectItem value="Bug Fix">Bug Fix</SelectItem>
                        <SelectItem value="Feature Enhancement">Feature Enhancement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={newRequest.priority}
                      onValueChange={(v) => setNewRequest({ ...newRequest, priority: v as TicketPriority })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Change Description</Label>
                  <Textarea
                    placeholder="Describe the change in detail..."
                    value={newRequest.changeDescription}
                    onChange={(e) => setNewRequest({ ...newRequest, changeDescription: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Impacted Systems (comma separated)</Label>
                  <Input
                    placeholder="e.g., CMS, Database, API"
                    value={newRequest.impactedSystems}
                    onChange={(e) => setNewRequest({ ...newRequest, impactedSystems: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Requested Go-Live Date</Label>
                  <Input
                    type="date"
                    value={newRequest.requestedGoLiveDate}
                    onChange={(e) => setNewRequest({ ...newRequest, requestedGoLiveDate: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateRequest} 
                  disabled={!newRequest.applicationName || !newRequest.changeDescription}
                >
                  Submit RFC
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total RFCs</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{websiteChangeRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Submitted</CardTitle>
            <div className="h-4 w-4 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {websiteChangeRequests.filter(r => r.status === 'Submitted').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Under Review</CardTitle>
            <div className="h-4 w-4 rounded-full bg-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {websiteChangeRequests.filter(r => r.status === 'Under Review').length}
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
              {websiteChangeRequests.filter(r => r.status === 'Approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Deployed</CardTitle>
            <Rocket className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {websiteChangeRequests.filter(r => r.status === 'Deployed').length}
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
              placeholder="Search RFCs..."
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
          <CardTitle>Change Requests ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RFC ID</TableHead>
                  <TableHead>Application</TableHead>
                  <TableHead>Change Type</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Go-Live Date</TableHead>
                  <TableHead className="w-[150px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.requestId}>
                      <TableCell className="font-medium">{request.requestId}</TableCell>
                      <TableCell>{request.applicationName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getChangeTypeIcon(request.changeType)}
                          {request.changeType}
                        </div>
                      </TableCell>
                      <TableCell>{request.requester}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(request.priority)}>{request.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                      </TableCell>
                      <TableCell>{request.requestedGoLiveDate}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {request.status === 'Under Review' && hasPermission('approve_website_request') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600"
                              onClick={() => handleApprove(request.requestId)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          )}
                          {request.status === 'Approved' && hasPermission('approve_website_request') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-purple-600"
                              onClick={() => handleDeploy(request.requestId)}
                            >
                              <Rocket className="h-4 w-4 mr-1" />
                              Deploy
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
    </div>
  );
}
