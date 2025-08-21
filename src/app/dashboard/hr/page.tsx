"use client"

import { useState, useEffect, useMemo } from "react"
import { dataService } from "@/lib/data-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { PlusCircle, Search, Trash2, Edit, Users, Briefcase, CheckCircle, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Define a proper type for Employee
type Employee = {
  id: string;
  employeeId: string;
  name: string;
  position: string;
  department: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  [key: string]: any; // Allow other properties
};

export default function HrPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  const initialFormData = {
    id: '',
    name: '',
    email: '',
    position: '',
    department: '技术部',
    status: 'active' as 'active' | 'inactive' | 'pending',
  };
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    dataService.initializeData();
    loadEmployees();
  }, [])

  const loadEmployees = () => {
    const allEmployees = dataService.getEmployees();
    setEmployees(allEmployees);
  }

  const filteredEmployees = useMemo(() => employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  ), [employees, searchTerm]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.position) {
      toast.error("[VALIDATION_ERROR] :: Name, Email, and Position are required.");
      return;
    }

    try {
      if (editingEmployee) {
        dataService.updateUser(formData.id, formData);
        toast.success(`[SUCCESS] :: Employee ${formData.name} record updated.`);
      } else {
        dataService.addUser({ ...formData, id: `user-${Date.now()}` });
        toast.success(`[SUCCESS] :: New employee ${formData.name} added to database.`);
      }
      loadEmployees();
      setIsFormOpen(false);
      setEditingEmployee(null);
    } catch (error) {
      toast.error("[SYSTEM_ERROR] :: Failed to save employee data.");
      console.error(error);
    }
  }

  const openForm = (employee: Employee | null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        id: employee.id,
        name: employee.name,
        email: employee.email,
        position: employee.position,
        department: employee.department,
        status: employee.status,
      });
    } else {
      setEditingEmployee(null);
      setFormData(initialFormData);
    }
    setIsFormOpen(true);
  }

  const handleDelete = (id: string) => {
    try {
      dataService.deleteUser(id);
      toast.success(`[SUCCESS] :: Employee record terminated.`);
      loadEmployees();
    } catch (error) {
       toast.error("[SYSTEM_ERROR] :: Failed to delete employee data.");
       console.error(error);
    }
  }

  const stats = useMemo(() => ({
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    pending: employees.filter(e => e.status === 'pending').length,
    inactive: employees.filter(e => e.status === 'inactive').length,
  }), [employees]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-terminus-accent tracking-wider">Human Resources Matrix</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openForm(null)} className="bg-terminus-accent text-terminus-bg-primary hover:bg-terminus-accent/90">
              <PlusCircle className="mr-2 h-5 w-5" />
              Onboard New Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-terminus-bg-secondary border-terminus-border text-terminus-text-primary">
            <DialogHeader>
              <DialogTitle className="text-terminus-accent">{editingEmployee ? "Update Asset Record" : "Onboard New Asset"}</DialogTitle>
              <DialogDescription>
                Input asset data into the system registry.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Asset Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="bg-terminus-bg-primary border-terminus-border" />
                <Input placeholder="Asset Email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required className="bg-terminus-bg-primary border-terminus-border" />
              </div>
              <Input placeholder="Asset Position" value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} required className="bg-terminus-bg-primary border-terminus-border" />
              <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
                <SelectTrigger className="bg-terminus-bg-primary border-terminus-border"><SelectValue placeholder="Select Department" /></SelectTrigger>
                <SelectContent className="bg-terminus-bg-secondary border-terminus-border text-terminus-text-primary">
                  <SelectItem value="技术部">技术部</SelectItem>
                  <SelectItem value="业务部门">业务部门</SelectItem>
                  <SelectItem value="人力资源部">人力资源部</SelectItem>
                  <SelectItem value="财务部">财务部</SelectItem>
                </SelectContent>
              </Select>
               <Select value={formData.status} onValueChange={(value: 'active' | 'inactive' | 'pending') => setFormData({...formData, status: value})}>
                <SelectTrigger className="bg-terminus-bg-primary border-terminus-border"><SelectValue placeholder="Select Status" /></SelectTrigger>
                <SelectContent className="bg-terminus-bg-secondary border-terminus-border text-terminus-text-primary">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-terminus-accent text-terminus-bg-primary hover:bg-terminus-accent/90">{editingEmployee ? "Update Record" : "Add to Registry"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-terminus-bg-secondary border-terminus-border"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Assets</CardTitle><Users className="h-5 w-5 text-terminus-text-primary/70" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
        <Card className="bg-terminus-bg-secondary border-terminus-border"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Active</CardTitle><CheckCircle className="h-5 w-5 text-green-400" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-400">{stats.active}</div></CardContent></Card>
        <Card className="bg-terminus-bg-secondary border-terminus-border"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Pending</CardTitle><Briefcase className="h-5 w-5 text-yellow-400" /></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-400">{stats.pending}</div></CardContent></Card>
        <Card className="bg-terminus-bg-secondary border-terminus-border"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Inactive</CardTitle><XCircle className="h-5 w-5 text-red-400" /></CardHeader><CardContent><div className="text-2xl font-bold text-red-400">{stats.inactive}</div></CardContent></Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-terminus-text-primary/30" />
        <Input
          placeholder="Search by name, email, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full bg-terminus-bg-secondary border-terminus-border h-12"
        />
      </div>

      <Card className="bg-terminus-bg-secondary border-terminus-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b-terminus-border hover:bg-terminus-bg-primary/5">
                <TableHead className="text-terminus-accent">Employee Name</TableHead>
                <TableHead className="text-terminus-accent">Email</TableHead>
                <TableHead className="text-terminus-accent">Department</TableHead>
                <TableHead className="text-terminus-accent">Position</TableHead>
                <TableHead className="text-terminus-accent">Status</TableHead>
                <TableHead className="text-terminus-accent text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map(emp => (
                <TableRow key={emp.id} className="border-b-terminus-border hover:bg-terminus-accent/5">
                  <TableCell className="font-medium">{emp.name}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell>{emp.position}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      emp.status === 'active' ? 'border-green-400 text-green-400' :
                      emp.status === 'inactive' ? 'border-red-400 text-red-400' : 'border-yellow-400 text-yellow-400'
                    }>
                      {emp.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => openForm(emp)} className="hover:bg-terminus-accent/10 hover:text-terminus-accent">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-400/70 hover:bg-red-400/10 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-terminus-bg-secondary border-terminus-border text-terminus-text-primary">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-terminus-warning">Terminate Asset Record?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the record for {emp.name}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel asChild><Button type="button" variant="ghost">Abort</Button></AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(emp.id)} className="bg-terminus-warning text-terminus-bg-primary hover:bg-terminus-warning/90">Confirm Termination</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
