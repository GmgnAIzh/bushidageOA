"use client"

import { useState, useEffect, useMemo } from "react"
import { dataService } from "@/lib/data-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { PlusCircle, FileText, CheckCircle, XCircle, Clock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define types
type ApprovalRequest = {
  id: string;
  title: string;
  applicant: string;
  type: 'leave' | 'expense' | 'purchase' | 'hiring';
  status: 'pending' | 'approved' | 'rejected';
  submitTime: string;
  [key: string]: any;
};

export default function ApprovalsPage() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const initialFormData = {
    title: '',
    type: 'leave' as 'leave' | 'expense' | 'purchase' | 'hiring',
    description: '',
  };
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    dataService.initializeData();
    loadRequests();
  }, [])

  const loadRequests = () => {
    const allRequests = dataService.getApprovalRequests();
    setRequests(allRequests);
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error("[VALIDATION_ERROR] :: Title and Description are required.");
      return;
    }

    const newRequest = {
      ...formData,
      id: dataService.generateId(),
      applicant: "System Administrator", // Mock applicant
      submitTime: new Date().toISOString(),
      status: 'pending',
      approvalFlow: [{ status: 'pending' }], // Simplified flow
    };

    const updatedRequests = [newRequest, ...dataService.getApprovalRequests()];
    dataService.saveApprovalRequests(updatedRequests);

    toast.success(`[SUCCESS] :: Approval request "${formData.title}" submitted.`);
    loadRequests();
    setIsFormOpen(false);
    setFormData(initialFormData);
  }

  const handleApprovalAction = (requestId: string, newStatus: 'approved' | 'rejected') => {
      const allRequests = dataService.getApprovalRequests();
      const updatedRequests = allRequests.map((req: ApprovalRequest) =>
        req.id === requestId ? { ...req, status: newStatus } : req
      );
      dataService.saveApprovalRequests(updatedRequests);
      loadRequests();
      toast.success(`Request has been ${newStatus}.`);
  }

  const getStatusBadge = (status: ApprovalRequest['status']) => {
      switch (status) {
          case 'approved': return <Badge variant="outline" className="border-green-400 text-green-400"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
          case 'rejected': return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/50"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
          case 'pending': return <Badge variant="outline" className="border-yellow-400 text-yellow-400"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
          default: return null;
      }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-terminus-accent tracking-wider">Approval Workflow</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-terminus-accent text-terminus-bg-primary hover:bg-terminus-accent/90">
              <PlusCircle className="mr-2 h-5 w-5" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-terminus-bg-secondary border-terminus-border text-terminus-text-primary">
            <DialogHeader><DialogTitle className="text-terminus-accent">Submit New Request</DialogTitle></DialogHeader>
            <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
              <Input placeholder="Request Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required className="bg-terminus-bg-primary border-terminus-border h-12" />
              <Select value={formData.type} onValueChange={(value: 'leave' | 'expense' | 'purchase' | 'hiring') => setFormData({...formData, type: value})}>
                <SelectTrigger className="bg-terminus-bg-primary border-terminus-border h-12"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-terminus-bg-secondary border-terminus-border text-terminus-text-primary">
                  <SelectItem value="leave">Leave Request</SelectItem>
                  <SelectItem value="expense">Expense Claim</SelectItem>
                  <SelectItem value="purchase">Purchase Order</SelectItem>
                  <SelectItem value="hiring">Hiring Request</SelectItem>
                </SelectContent>
              </Select>
              <textarea placeholder="Request Description..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required className="bg-terminus-bg-primary border-terminus-border w-full p-2 rounded-md min-h-24" />
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-terminus-accent text-terminus-bg-primary hover:bg-terminus-accent/90">Submit</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-terminus-bg-secondary">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
            <ApprovalTable requests={requests.filter(r => r.status === 'pending')} handleApprovalAction={handleApprovalAction} getStatusBadge={getStatusBadge} />
        </TabsContent>
        <TabsContent value="approved">
            <ApprovalTable requests={requests.filter(r => r.status === 'approved')} getStatusBadge={getStatusBadge} />
        </TabsContent>
        <TabsContent value="rejected">
            <ApprovalTable requests={requests.filter(r => r.status === 'rejected')} getStatusBadge={getStatusBadge} />
        </TabsContent>
        <TabsContent value="all">
            <ApprovalTable requests={requests} getStatusBadge={getStatusBadge} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ApprovalTable({ requests, getStatusBadge, handleApprovalAction }: { requests: ApprovalRequest[], getStatusBadge: Function, handleApprovalAction?: Function }) {
    return (
        <Card className="bg-terminus-bg-secondary border-terminus-border mt-4">
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow className="border-b-terminus-border"><TableHead className="text-terminus-accent">Request</TableHead><TableHead className="text-terminus-accent">Applicant</TableHead><TableHead className="text-terminus-accent">Type</TableHead><TableHead className="text-terminus-accent">Submitted</TableHead><TableHead className="text-terminus-accent">Status</TableHead>{handleApprovalAction && <TableHead className="text-terminus-accent text-right">Actions</TableHead>}</TableRow></TableHeader>
                <TableBody>
                  {requests.map(req => (
                    <TableRow key={req.id} className="border-b-terminus-border">
                      <TableCell className="font-medium">{req.title}</TableCell>
                      <TableCell>{req.applicant}</TableCell>
                      <TableCell>{req.type}</TableCell>
                      <TableCell>{new Date(req.submitTime).toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(req.status)}</TableCell>
                      {handleApprovalAction && (
                        <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                                <Button size="sm" onClick={() => handleApprovalAction(req.id, 'approved')} className="bg-green-500/20 text-green-400 hover:bg-green-500/30">Approve</Button>
                                <Button size="sm" onClick={() => handleApprovalAction(req.id, 'rejected')} className="bg-red-500/20 text-red-400 hover:bg-red-500/30">Reject</Button>
                            </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
        </Card>
    )
}
