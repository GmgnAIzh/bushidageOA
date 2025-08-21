"use client"

import { useState, useEffect, useMemo } from "react"
import { dataService } from "@/lib/data-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, BarChart as RechartsBar, XAxis, YAxis, Tooltip, Legend, Bar, LineChart, Line } from 'recharts';
import { TrendingUp, Users, DollarSign, FileText } from "lucide-react"

export default function ReportsPage() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    netIncome: 0,
    pendingApprovals: 0,
    activeProjects: 0,
    hr: [],
    finance: [],
    approvals: [],
  });

  useEffect(() => {
    dataService.initializeData();

    const employees = dataService.getEmployees();
    const transactions = dataService.getTransactions();
    const approvals = dataService.getApprovalRequests();
    const projects = dataService.getProjects();

    const totalReceive = transactions.filter((t: any) => t.type === 'receive').reduce((sum: number, t: any) => sum + t.usdValue, 0);
    const totalSend = transactions.filter((t: any) => t.type === 'send').reduce((sum: number, t: any) => sum + t.usdValue, 0);

    const approvalTypes = approvals.reduce((acc: any, req: any) => {
        acc[req.type] = (acc[req.type] || 0) + 1;
        return acc;
    }, {});

    setStats({
      totalEmployees: employees.length,
      netIncome: totalReceive - totalSend,
      pendingApprovals: approvals.filter((a: any) => a.status === 'pending').length,
      activeProjects: projects.filter((p: any) => p.status === 'active').length,
      hr: employees.reduce((acc: any, emp: any) => {
          const dept = acc.find((d: any) => d.name === emp.department);
          if (dept) dept.count++;
          else acc.push({ name: emp.department, count: 1 });
          return acc;
      }, []),
      finance: [
          { name: 'Income', value: totalReceive },
          { name: 'Expense', value: totalSend },
      ],
      approvals: Object.entries(approvalTypes).map(([name, value]) => ({ name, value })),
    });
  }, []);

  const COLORS = ['#00E5FF', '#8884d8', '#FFBB28', '#FF8042', '#00C49F'];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-terminus-accent tracking-wider">Data & Reports</h1>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-terminus-bg-secondary border-terminus-border"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Employees</CardTitle><Users className="h-5 w-5 text-terminus-accent" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalEmployees}</div></CardContent></Card>
        <Card className="bg-terminus-bg-secondary border-terminus-border"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Net Income</CardTitle><DollarSign className="h-5 w-5 text-green-400" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-400">${stats.netIncome.toLocaleString()}</div></CardContent></Card>
        <Card className="bg-terminus-bg-secondary border-terminus-border"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Pending Approvals</CardTitle><FileText className="h-5 w-5 text-yellow-400" /></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-400">{stats.pendingApprovals}</div></CardContent></Card>
        <Card className="bg-terminus-bg-secondary border-terminus-border"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Active Projects</CardTitle><TrendingUp className="h-5 w-5 text-orange-400" /></CardHeader><CardContent><div className="text-2xl font-bold text-orange-400">{stats.activeProjects}</div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-terminus-bg-secondary border-terminus-border">
            <CardHeader><CardTitle className="text-terminus-accent">HR Overview</CardTitle></CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <RechartsBar data={stats.hr}>
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                        <Tooltip wrapperClassName="!bg-terminus-bg-primary !border-terminus-border" cursor={{fill: 'rgba(139, 233, 253, 0.1)'}}/>
                        <Bar dataKey="count" name="Employees" fill="#00E5FF" radius={[4, 4, 0, 0]} />
                    </RechartsBar>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        <Card className="bg-terminus-bg-secondary border-terminus-border">
            <CardHeader><CardTitle className="text-terminus-accent">Approval Request Types</CardTitle></CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <RechartsPie data={stats.approvals} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                        {stats.approvals.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </RechartsPie>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
