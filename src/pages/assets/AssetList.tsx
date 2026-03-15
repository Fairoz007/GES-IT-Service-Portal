import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBackend } from '@/contexts/BackendContext';
import { cn, formatDate, getStatusColor } from '@/lib/utils';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  QrCode,
  Package,
  Download,
  Upload,
} from 'lucide-react';
import type { AssetType, AssetStatus } from '@/types';

export function AssetList() {
  const { user, hasPermission } = useAuth();
  const { assets, createAsset, deleteAsset, users } = useBackend();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<AssetType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AssetStatus | 'all'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  
  // New asset form state
  const [newAsset, setNewAsset] = useState({
    assetType: 'Laptop' as AssetType,
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    warrantyExpiry: '',
    location: '',
    notes: '',
  });

  // Filter assets
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = 
      asset.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.assignedToName && asset.assignedToName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || asset.assetType === typeFilter;
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateAsset = async () => {
    try {
      const result = await createAsset({
        assetType: newAsset.assetType,
        brand: newAsset.brand,
        model: newAsset.model,
        serialNumber: newAsset.serialNumber,
        purchaseDate: newAsset.purchaseDate,
        warrantyExpiry: newAsset.warrantyExpiry,
        location: newAsset.location,
        notes: newAsset.notes,
      });
      
      setIsCreateDialogOpen(false);
      setNewAsset({
        assetType: 'Laptop',
        brand: '',
        model: '',
        serialNumber: '',
        purchaseDate: '',
        warrantyExpiry: '',
        location: '',
        notes: '',
      });
      
      if (result && result.assetId) {
        navigate(`/assets/${result.assetId}`);
      }
    } catch (error) {
      console.error("Failed to create asset", error);
    }
  };

  const handleDelete = (assetId: string) => {
    if (confirm('Are you sure you want to delete this asset?')) {
      deleteAsset(assetId);
    }
  };

  const exportAssets = () => {
    const csvContent = [
      ['Asset Code', 'Type', 'Brand', 'Model', 'Serial Number', 'Status', 'Assigned To', 'Department', 'Location', 'Purchase Date', 'Warranty Expiry'].join(','),
      ...filteredAssets.map(a => [
        a.assetCode,
        a.assetType,
        a.brand,
        a.model,
        a.serialNumber,
        a.status,
        a.assignedToName || '',
        a.department || '',
        a.location,
        a.purchaseDate,
        a.warrantyExpiry,
      ].join(',')),
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assets-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asset Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage IT assets and equipment inventory
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportAssets}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          {hasPermission('create_asset') && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Asset
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Asset</DialogTitle>
                  <DialogDescription>
                    Register a new IT asset in the inventory
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Asset Type</Label>
                    <Select
                      value={newAsset.assetType}
                      onValueChange={(v) => setNewAsset({ ...newAsset, assetType: v as AssetType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Laptop">Laptop</SelectItem>
                        <SelectItem value="Desktop">Desktop</SelectItem>
                        <SelectItem value="Monitor">Monitor</SelectItem>
                        <SelectItem value="Printer">Printer</SelectItem>
                        <SelectItem value="Server">Server</SelectItem>
                        <SelectItem value="Network Equipment">Network Equipment</SelectItem>
                        <SelectItem value="Mobile Device">Mobile Device</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Brand</Label>
                      <Input
                        placeholder="e.g., Dell"
                        value={newAsset.brand}
                        onChange={(e) => setNewAsset({ ...newAsset, brand: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Model</Label>
                      <Input
                        placeholder="e.g., Latitude 5520"
                        value={newAsset.model}
                        onChange={(e) => setNewAsset({ ...newAsset, model: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Serial Number</Label>
                    <Input
                      placeholder="Enter serial number"
                      value={newAsset.serialNumber}
                      onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Purchase Date</Label>
                      <Input
                        type="date"
                        value={newAsset.purchaseDate}
                        onChange={(e) => setNewAsset({ ...newAsset, purchaseDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Warranty Expiry</Label>
                      <Input
                        type="date"
                        value={newAsset.warrantyExpiry}
                        onChange={(e) => setNewAsset({ ...newAsset, warrantyExpiry: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      placeholder="e.g., Floor 2, Desk 15"
                      value={newAsset.location}
                      onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Input
                      placeholder="Additional notes..."
                      value={newAsset.notes}
                      onChange={(e) => setNewAsset({ ...newAsset, notes: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateAsset} 
                    disabled={!newAsset.brand || !newAsset.model || !newAsset.serialNumber}
                  >
                    Add Asset
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as AssetType | 'all')}>
              <SelectTrigger className="w-[150px]">
                <Package className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Laptop">Laptop</SelectItem>
                <SelectItem value="Desktop">Desktop</SelectItem>
                <SelectItem value="Monitor">Monitor</SelectItem>
                <SelectItem value="Printer">Printer</SelectItem>
                <SelectItem value="Server">Server</SelectItem>
                <SelectItem value="Network Equipment">Network Equipment</SelectItem>
                <SelectItem value="Mobile Device">Mobile Device</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AssetStatus | 'all')}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Assigned">Assigned</SelectItem>
                <SelectItem value="In Maintenance">In Maintenance</SelectItem>
                <SelectItem value="Retired">Retired</SelectItem>
                <SelectItem value="Disposed">Disposed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assets ({filteredAssets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Brand/Model</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Warranty</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No assets found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssets.map((asset) => (
                    <TableRow
                      key={asset.assetId}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/assets/${asset.assetId}`)}
                    >
                      <TableCell className="font-medium">{asset.assetCode}</TableCell>
                      <TableCell>{asset.assetType}</TableCell>
                      <TableCell>{asset.brand} {asset.model}</TableCell>
                      <TableCell className="font-mono text-xs">{asset.serialNumber}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(asset.status)}>{asset.status}</Badge>
                      </TableCell>
                      <TableCell>{asset.assignedToName || '-'}</TableCell>
                      <TableCell>{asset.location}</TableCell>
                      <TableCell>
                        {isWarrantyExpired(asset.warrantyExpiry) ? (
                          <Badge variant="destructive">Expired</Badge>
                        ) : isWarrantyExpiringSoon(asset.warrantyExpiry) ? (
                          <Badge variant="secondary">Expiring Soon</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {formatDate(asset.warrantyExpiry)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/assets/${asset.assetId}`);
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            {hasPermission('edit_asset') && (
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/assets/${asset.assetId}?edit=true`);
                              }}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {hasPermission('delete_asset') && (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(asset.assetId);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
