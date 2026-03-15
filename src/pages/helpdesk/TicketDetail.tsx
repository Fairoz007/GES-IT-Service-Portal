import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBackend } from '@/contexts/BackendContext';
import { cn, formatDateTime, getStatusColor, getPriorityColor } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  ArrowLeft,
  MessageSquare,
  Clock,
  User,
  Tag,
  AlertCircle,
  CheckCircle,
  Send,
  Paperclip,
  History,
  Edit,
} from 'lucide-react';
import type { TicketStatus, TicketPriority, UserRole } from '@/types';

export function TicketDetail() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const { getTicketById, updateTicket, users, createNotification } = useBackend();
  
  const ticket = getTicketById(ticketId || '');
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [editedTicket, setEditedTicket] = useState(ticket);

  useEffect(() => {
    if (ticket) {
      setEditedTicket(ticket);
    }
  }, [ticket]);

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Ticket not found</h2>
        <p className="text-muted-foreground mb-4">The ticket you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/helpdesk')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Helpdesk
        </Button>
      </div>
    );
  }

  // Check if user can view this ticket
  const canView = hasPermission('view_all_tickets') || ticket.userId === user?.id;
  const canEdit = hasPermission('assign_ticket') || ticket.userId === user?.id;
  const canAssign = hasPermission('assign_ticket');

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground mb-4">You don't have permission to view this ticket.</p>
        <Button onClick={() => navigate('/helpdesk')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Helpdesk
        </Button>
      </div>
    );
  }

  const handleUpdateTicket = () => {
    if (!editedTicket) return;
    
    updateTicket(ticket.ticketId, {
      status: editedTicket.status,
      priority: editedTicket.priority,
      assignedTo: editedTicket.assignedTo,
      assignedToName: editedTicket.assignedToName,
    });

    // Create notification for assignment
    if (editedTicket.assignedTo && editedTicket.assignedTo !== ticket.assignedTo) {
      createNotification({
        userId: editedTicket.assignedTo,
        type: 'Ticket',
        title: 'New Ticket Assigned',
        message: `Ticket ${ticket.ticketId} has been assigned to you`,
        link: `/helpdesk/${ticket.ticketId}`,
      });
    }

    setIsEditing(false);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const activityLog = [...ticket.activityLog, {
      id: Math.random().toString(36).substring(2),
      timestamp: new Date().toISOString(),
      user: user?.name || '',
      action: 'Comment Added',
      details: newNote,
    }];
    
    updateTicket(ticket.ticketId, { activityLog });
    setNewNote('');
  };

  const getSLAStatus = () => {
    if (ticket.status === 'Closed' || ticket.status === 'Resolved') {
      return { label: 'Completed', color: 'text-green-500' };
    }
    
    const deadline = new Date(ticket.slaDeadline);
    const now = new Date();
    const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursRemaining < 0) {
      return { label: 'Overdue', color: 'text-red-500' };
    }
    if (hoursRemaining < 4) {
      return { label: 'Due Soon', color: 'text-yellow-500' };
    }
    return { label: 'On Track', color: 'text-green-500' };
  };

  const slaStatus = getSLAStatus();
  const itStaff = users.filter(u => u.role === 'IT Staff' || u.role === 'Admin');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/helpdesk')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{ticket.ticketId}</h1>
              <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
            </div>
            <p className="text-muted-foreground">
              Created {formatDateTime(ticket.createdAt)}
            </p>
          </div>
        </div>
        {canEdit && (
          <Button onClick={() => setIsEditing(!isEditing)}>
            <Edit className="mr-2 h-4 w-4" />
            {isEditing ? 'Cancel' : 'Edit Ticket'}
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Card */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{ticket.description}</p>
              
              {ticket.attachment && (
                <div className="mt-4">
                  <Label className="text-sm text-muted-foreground">Attachment</Label>
                  <div className="flex items-center gap-2 mt-1 p-2 rounded-lg border">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{ticket.attachment}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ticket.activityLog.map((activity, index) => (
                  <div key={activity.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <History className="h-4 w-4 text-primary" />
                      </div>
                      {index < ticket.activityLog.length - 1 && (
                        <div className="w-px flex-1 bg-border my-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{activity.action}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(activity.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.user}</p>
                      {activity.details && (
                        <p className="text-sm mt-1">{activity.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Add Comment */}
          <Card>
            <CardHeader>
              <CardTitle>Add Comment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Add a comment or update..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                    <Send className="mr-2 h-4 w-4" />
                    Add Comment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={editedTicket?.status}
                      onValueChange={(v) => setEditedTicket(prev => prev ? { ...prev, status: v as TicketStatus } : prev)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={editedTicket?.priority}
                      onValueChange={(v) => setEditedTicket(prev => prev ? { ...prev, priority: v as TicketPriority } : prev)}
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
                  
                  {canAssign && (
                    <div className="space-y-2">
                      <Label>Assign To</Label>
                      <Select
                        value={editedTicket?.assignedTo}
                        onValueChange={(v) => {
                          const assignedUser = users.find(u => u.id === v);
                          setEditedTicket(prev => prev ? {
                            ...prev,
                            assignedTo: v,
                            assignedToName: assignedUser?.name,
                          } : prev);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Unassigned</SelectItem>
                          {itStaff.map((staff) => (
                            <SelectItem key={staff.id} value={staff.id}>
                              {staff.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <Button onClick={handleUpdateTicket} className="w-full">
                    Save Changes
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Priority</span>
                    <span className={cn('flex items-center gap-1 text-sm', getPriorityColor(ticket.priority))}>
                      <AlertCircle className="h-3 w-3" />
                      {ticket.priority}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <span className="text-sm">{ticket.category}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">SLA Status</span>
                    <span className={cn('flex items-center gap-1 text-sm', slaStatus.color)}>
                      <Clock className="h-3 w-3" />
                      {slaStatus.label}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Requester Info */}
          <Card>
            <CardHeader>
              <CardTitle>Requester</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ticket.userId}`} />
                  <AvatarFallback>{ticket.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{ticket.userName}</p>
                  <p className="text-sm text-muted-foreground">{ticket.department}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  {ticket.department}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {ticket.location}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned To */}
          {ticket.assignedTo && (
            <Card>
              <CardHeader>
                <CardTitle>Assigned To</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ticket.assignedTo}`} />
                    <AvatarFallback>{ticket.assignedToName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{ticket.assignedToName}</p>
                    <p className="text-sm text-muted-foreground">IT Support</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
