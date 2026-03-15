import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBackend } from '@/contexts/BackendContext';
import { cn, formatDate, formatDateTime, getStatusColor } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Calendar,
  Shield,
  QrCode,
  History,
  Edit,
  Printer,
  Download,
  UserPlus,
  RotateCcw,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { AssetStatus } from '@/types';

export function AssetDetail() {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const { getAssetById, updateAsset, users, createNotification } = useBackend();
  
  const asset = getAssetById(assetId || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [editedAsset, setEditedAsset] = useState(asset);
  const [selectedUser, setSelectedUser] = useState('');
  const [returnNotes, setReturnNotes] = useState('');

  useEffect(() => {
    if (asset) {
      setEditedAsset(asset);
    }
  }, [asset]);

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Asset not found</h2>
        <p className="text-muted-foreground mb-4">The asset you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/assets')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assets
        </Button>
      </div>
    );
  }

  const canEdit = hasPermission('edit_asset');
  const canAssign = hasPermission('assign_asset');

  const handleUpdateAsset = () => {
    if (!editedAsset) return;
    
    updateAsset(asset.assetId, {
      status: editedAsset.status,
      location: editedAsset.location,
      notes: editedAsset.notes,
    });

    setIsEditing(false);
  };

  const handleAssign = () => {
    if (!selectedUser) return;
    
    const assignedUser = users.find(u => u.id === selectedUser);
    if (!assignedUser) return;

    const historyEntry = {
      id: Math.random().toString(36).substring(2),
      timestamp: new Date().toISOString(),
      action: 'Assigned',
      user: user?.name || '',
      details: `Assigned to ${assignedUser.name}`,
    };

    updateAsset(asset.assetId, {
      assignedTo: selectedUser,
      assignedToName: assignedUser.name,
      department: assignedUser.department,
      status: 'Assigned' as AssetStatus,
      history: [...asset.history, historyEntry],
    });

    createNotification({
      userId: selectedUser,
      type: 'Asset',
      title: 'Asset Assigned',
      message: `Asset ${asset.assetCode} has been assigned to you`,
      link: `/assets/${asset.assetId}`,
    });

    setIsAssignDialogOpen(false);
    setSelectedUser('');
  };

  const handleReturn = () => {
    const historyEntry = {
      id: Math.random().toString(36).substring(2),
      timestamp: new Date().toISOString(),
      action: 'Returned',
      user: user?.name || '',
      details: returnNotes || 'Asset returned to inventory',
    };

    updateAsset(asset.assetId, {
      assignedTo: undefined,
      assignedToName: undefined,
      department: undefined,
      status: 'Available' as AssetStatus,
      history: [...asset.history, historyEntry],
    });

    setIsReturnDialogOpen(false);
    setReturnNotes('');
  };

  const isWarrantyExpiringSoon = (warrantyDate: string) => {
    const warranty = new Date(warrantyDate);
    const now = new Date();
    const daysRemaining = (warranty.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysRemaining < 30 && daysRemaining > 0;
  };

  const isWarrantyExpired = (warrantyDate: string) => {
    return new Date(warrantyDate) < new Date();
  };

  const availableUsers = users.filter(u => u.status === 'Active' && u.id !== asset.assignedTo);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/assets')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{asset.assetCode}</h1>
              <Badge className={getStatusColor(asset.status)}>{asset.status}</Badge>
            </div>
            <p className="text-muted-foreground">
              {asset.brand} {asset.model}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          {canEdit && (
            <Button onClick={() => setIsEditing(!isEditing)}>
              <Edit className="mr-2 h-4 w-4" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Asset Info */}
          <Card>
            <CardHeader>
              <CardTitle>Asset Information</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={editedAsset?.status}
                      onValueChange={(v) => setEditedAsset(prev => prev ? { ...prev, status: v as AssetStatus } : prev)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Assigned">Assigned</SelectItem>
                        <SelectItem value="In Maintenance">In Maintenance</SelectItem>
                        <SelectItem value="Retired">Retired</SelectItem>
                        <SelectItem value="Disposed">Disposed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={editedAsset?.location}
                      onChange={(e) => setEditedAsset(prev => prev ? { ...prev, location: e.target.value } : prev)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={editedAsset?.notes}
                      onChange={(e) => setEditedAsset(prev => prev ? { ...prev, notes: e.target.value } : prev)}
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleUpdateAsset}>Save Changes</Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Asset Type</Label>
                      <p className="font-medium">{asset.assetType}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Brand</Label>
                      <p className="font-medium">{asset.brand}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Model</Label>
                      <p className="font-medium">{asset.model}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Serial Number</Label>
                      <p className="font-mono text-sm">{asset.serialNumber}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Purchase Date</Label>
                      <p className="font-medium">{formatDate(asset.purchaseDate)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Warranty Expiry</Label>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{formatDate(asset.warrantyExpiry)}</p>
                        {isWarrantyExpired(asset.warrantyExpiry) && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                        {isWarrantyExpiringSoon(asset.warrantyExpiry) && (
                          <Badge variant="secondary">Expiring Soon</Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Location</Label>
                      <p className="font-medium">{asset.location}</p>
                    </div>
                    {asset.notes && (
                      <div>
                        <Label className="text-muted-foreground">Notes</Label>
                        <p className="text-sm">{asset.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle>Asset History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...asset.history].reverse().map((entry, index) => (
                  <div key={entry.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <History className="h-4 w-4 text-primary" />
                      </div>
                      {index < asset.history.length - 1 && (
                        <div className="w-px flex-1 bg-border my-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{entry.action}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(entry.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{entry.user}</p>
                      {entry.details && (
                        <p className="text-sm mt-1">{entry.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* QR Code */}
          <Card>
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
              <CardDescription>Scan to view asset details</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG
                  value={`${window.location.origin}/assets/${asset.assetId}`}
                  size={150}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                {asset.assetCode}
              </p>
              <Button variant="outline" className="mt-4 w-full" onClick={() => {
                const canvas = document.querySelector('canvas');
                if (canvas) {
                  const link = document.createElement('a');
                  link.download = `${asset.assetCode}-qr.png`;
                  link.href = canvas.toDataURL();
                  link.click();
                }
              }}>
                <Download className="mr-2 h-4 w-4" />
                Download QR
              </Button>
            </CardContent>
          </Card>

          {/* Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              {asset.assignedTo ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${asset.assignedTo}`} />
                      <AvatarFallback>{asset.assignedToName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{asset.assignedToName}</p>
                      <p className="text-sm text-muted-foreground">{asset.department}</p>
                    </div>
                  </div>
                  {canAssign && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setIsReturnDialogOpen(true)}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Return to Inventory
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">Not assigned</p>
                  {canAssign && (
                    <Button onClick={() => setIsAssignDialogOpen(true)}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Assign to User
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assign Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Asset</DialogTitle>
            <DialogDescription>
              Assign {asset.assetCode} to a user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={!selectedUser}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Dialog */}
      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Asset</DialogTitle>
            <DialogDescription>
              Return {asset.assetCode} to inventory
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Return Notes (Optional)</Label>
              <Textarea
                placeholder="Add any notes about the return..."
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReturnDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReturn} variant="default">
              Return to Inventory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
