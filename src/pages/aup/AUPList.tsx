import { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Shield,
  CheckCircle,
  FileSignature,
  User,
  Building,
  Calendar,
  AlertCircle,
} from 'lucide-react';

const AUP_CONTENT = `
ACCEPTABLE USE POLICY

1. PURPOSE
This Acceptable Use Policy (AUP) outlines the acceptable use of company IT resources and services.

2. SCOPE
This policy applies to all employees, contractors, and third parties who access company IT systems.

3. ACCEPTABLE USE
- Use company resources for business purposes only
- Protect confidential information
- Comply with all applicable laws and regulations
- Report security incidents promptly

4. PROHIBITED ACTIVITIES
- Unauthorized access to systems or data
- Distribution of malware or malicious code
- Personal use that interferes with work responsibilities
- Sharing passwords or access credentials

5. MONITORING
The company reserves the right to monitor network traffic and system usage for security purposes.

6. CONSEQUENCES
Violation of this policy may result in disciplinary action, including termination of employment.
`;

export function AUPList() {
  const { user, hasPermission } = useAuth();
  const { aupSignatures, createAUPSignature, verifyAUPSignature, users } = useBackend();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSignDialogOpen, setIsSignDialogOpen] = useState(false);
  const [hasReadPolicy, setHasReadPolicy] = useState(false);
  const [signature, setSignature] = useState('');

  // Filter signatures
  const filteredSignatures = aupSignatures.filter((sig) => {
    const matchesSearch = 
      sig.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sig.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sig.position.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Employees see their own signature
    if (user?.role === 'Employee') {
      return sig.employeeId === user.id;
    }
    
    return matchesSearch;
  });

  const pendingSignatures = users.filter(u => 
    u.status === 'Active' && 
    !aupSignatures.some(s => s.employeeId === u.id)
  );

  const handleSign = async () => {
    if (!user || !signature) return;
    
    try {
      await createAUPSignature({
        userId: user.id,
        userName: user.name,
        department: user.department,
        employeeCode: (user as any).employeeCode || '',
        signature: signature,
        userAgent: navigator.userAgent,
      });
      
      setIsSignDialogOpen(false);
      setHasReadPolicy(false);
      setSignature('');
    } catch (error) {
      console.error("Failed to sign AUP", error);
    }
  };

  const handleVerify = (signatureId: string) => {
    if (!user) return;
    verifyAUPSignature(signatureId, user.name);
  };

  const hasSigned = user ? aupSignatures.some(s => s.employeeId === user.id) : false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Acceptable Use Policy</h1>
          <p className="text-muted-foreground mt-1">
            Manage IT acceptable use policy signatures
          </p>
        </div>
        {!hasSigned && user?.role === 'Employee' && (
          <Dialog open={isSignDialogOpen} onOpenChange={setIsSignDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <FileSignature className="mr-2 h-4 w-4" />
                Sign AUP
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Acceptable Use Policy</DialogTitle>
                <DialogDescription>
                  Please read and acknowledge the IT Acceptable Use Policy
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Card className="bg-muted">
                  <CardContent className="p-4">
                    <pre className="whitespace-pre-wrap text-sm font-mono">{AUP_CONTENT}</pre>
                  </CardContent>
                </Card>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="read"
                    checked={hasReadPolicy}
                    onCheckedChange={(checked) => setHasReadPolicy(checked as boolean)}
                  />
                  <Label htmlFor="read" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I have read and understood the Acceptable Use Policy
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label>Electronic Signature (Type your full name)</Label>
                  <Input
                    placeholder="John Doe"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsSignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSign} 
                  disabled={!hasReadPolicy || !signature}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Sign Policy
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Signed</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aupSignatures.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aupSignatures.filter(s => s.verifiedBy).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSignatures.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Compliance Rate</CardTitle>
            <FileSignature className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.length > 0 ? Math.round((aupSignatures.length / users.length) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="signed" className="space-y-4">
        <TabsList>
          <TabsTrigger value="signed">Signed Policies</TabsTrigger>
          {hasPermission('verify_aup') && (
            <TabsTrigger value="pending">Pending Signatures</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="signed">
          <Card>
            <CardHeader>
              <CardTitle>Signed Policies</CardTitle>
              <CardDescription>
                Employees who have signed the acceptable use policy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search signatures..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Signed Date</TableHead>
                        <TableHead>Verification</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSignatures.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No signatures found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredSignatures.map((sig) => (
                          <TableRow key={sig.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                {sig.employeeName}
                              </div>
                            </TableCell>
                            <TableCell>{sig.department}</TableCell>
                            <TableCell>{sig.position}</TableCell>
                            <TableCell>{formatDateTime(sig.signedDate)}</TableCell>
                            <TableCell>
                              {sig.verifiedBy ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Pending Verification</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {!sig.verifiedBy && hasPermission('verify_aup') && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleVerify(sig.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Verify
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {hasPermission('verify_aup') && (
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Signatures</CardTitle>
                <CardDescription>
                  Employees who have not yet signed the acceptable use policy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingSignatures.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            All employees have signed the policy
                          </TableCell>
                        </TableRow>
                      ) : (
                        pendingSignatures.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                {u.name}
                              </div>
                            </TableCell>
                            <TableCell>{u.department}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>
                              <Badge variant="destructive">Not Signed</Badge>
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
        )}
      </Tabs>
    </div>
  );
}
