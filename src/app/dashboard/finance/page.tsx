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
import { PlusCircle, ArrowUpRight, ArrowDownLeft, DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define types
type Transaction = {
  id: string;
  type: 'send' | 'receive';
  currency: string;
  amount: number;
  usdValue: number;
  status: 'completed' | 'pending';
  time: string;
  [key: string]: any;
};

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const initialFormData = {
    type: 'send' as 'send' | 'receive',
    currency: 'USDT',
    amount: 0,
    description: '',
  };
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    dataService.initializeData();
    loadTransactions();
  }, [])

  const loadTransactions = () => {
    const allTransactions = dataService.getTransactions();
    setTransactions(allTransactions);
  }

  const summary = useMemo(() => {
    return transactions.reduce((acc, tx) => {
      if (tx.type === 'receive') {
        acc.income += tx.usdValue;
      } else {
        acc.expense += tx.usdValue;
      }
      return acc;
    }, { income: 0, expense: 0 });
  }, [transactions]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) {
      toast.error("[VALIDATION_ERROR] :: Amount must be positive.");
      return;
    }

    const newTransaction = {
      ...formData,
      id: dataService.generateId(),
      usdValue: formData.amount, // Assuming 1:1 for simplicity
      status: 'completed',
      time: new Date().toISOString(),
    };

    dataService.addTransaction(newTransaction);
    toast.success(`[SUCCESS] :: Transaction logged.`);
    loadTransactions();
    setIsFormOpen(false);
    setFormData(initialFormData);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-terminus-accent tracking-wider">Financial Operations</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-terminus-bg-secondary border-terminus-border"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Income</CardTitle><TrendingUp className="h-5 w-5 text-green-400" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-400">${summary.income.toLocaleString()}</div></CardContent></Card>
        <Card className="bg-terminus-bg-secondary border-terminus-border"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Expense</CardTitle><TrendingDown className="h-5 w-5 text-red-400" /></CardHeader><CardContent><div className="text-2xl font-bold text-red-400">${summary.expense.toLocaleString()}</div></CardContent></Card>
        <Card className="bg-terminus-bg-secondary border-terminus-border"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Net Profit</CardTitle><DollarSign className="h-5 w-5 text-terminus-accent" /></CardHeader><CardContent><div className="text-2xl font-bold text-terminus-accent">${(summary.income - summary.expense).toLocaleString()}</div></CardContent></Card>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-terminus-bg-secondary">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="wallets" disabled>Wallets (WIP)</TabsTrigger>
          <TabsTrigger value="expenses" disabled>Expenses (WIP)</TabsTrigger>
          <TabsTrigger value="reports" disabled>Reports (WIP)</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions" className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-terminus-accent/90">Transaction Ledger</h2>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="bg-terminus-accent text-terminus-bg-primary hover:bg-terminus-accent/90">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-terminus-bg-secondary border-terminus-border text-terminus-text-primary">
                <DialogHeader><DialogTitle className="text-terminus-accent">Log New Transaction</DialogTitle></DialogHeader>
                <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
                  <Select value={formData.type} onValueChange={(value: 'send' | 'receive') => setFormData({...formData, type: value})}>
                    <SelectTrigger className="bg-terminus-bg-primary border-terminus-border h-12"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-terminus-bg-secondary border-terminus-border text-terminus-text-primary">
                      <SelectItem value="send">Send</SelectItem>
                      <SelectItem value="receive">Receive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="number" placeholder="Amount (USD)" value={formData.amount} onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})} required className="bg-terminus-bg-primary border-terminus-border h-12" />
                  <textarea placeholder="Description..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="bg-terminus-bg-primary border-terminus-border w-full p-2 rounded-md min-h-24" />
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-terminus-accent text-terminus-bg-primary hover:bg-terminus-accent/90">Log Transaction</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <Card className="bg-terminus-bg-secondary border-terminus-border mt-4">
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow className="border-b-terminus-border"><TableHead className="text-terminus-accent">Date</TableHead><TableHead className="text-terminus-accent">Type</TableHead><TableHead className="text-terminus-accent">Amount</TableHead><TableHead className="text-terminus-accent">Description</TableHead><TableHead className="text-terminus-accent">Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {transactions.map(tx => (
                    <TableRow key={tx.id} className="border-b-terminus-border">
                      <TableCell>{new Date(tx.time).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className={`flex items-center ${tx.type === 'receive' ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.type === 'receive' ? <ArrowDownLeft className="mr-2 h-4 w-4" /> : <ArrowUpRight className="mr-2 h-4 w-4" />}
                          {tx.type}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">${tx.usdValue.toLocaleString()}</TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell><Badge variant="outline">{tx.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
