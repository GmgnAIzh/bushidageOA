"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { PlusCircle, Bot, Send, Settings, Trash2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type TelegramBot = {
  id: string;
  name: string;
  token: string;
  status: 'active' | 'inactive';
};

export default function TelegramPage() {
  const [bots, setBots] = useState<TelegramBot[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const initialFormData = {
    name: '',
    token: '',
  };
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    // Mock loading bots
    const mockBots: TelegramBot[] = [
      { id: 'bot1', name: 'OA Notifier', token: '123:ABC', status: 'active' },
      { id: 'bot2', name: 'Reports Bot', token: '456:DEF', status: 'inactive' },
    ];
    setBots(mockBots);
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.token) {
      toast.error("[VALIDATION_ERROR] :: Bot Name and Token are required.");
      return;
    }

    const newBot: TelegramBot = {
      id: `bot-${Date.now()}`,
      status: 'active',
      ...formData
    };

    setBots(prev => [...prev, newBot]);
    toast.success(`[SUCCESS] :: Telegram bot "${formData.name}" configured.`);
    setIsFormOpen(false);
    setFormData(initialFormData);
  };

  const handleDeleteBot = (botId: string) => {
      setBots(prev => prev.filter(b => b.id !== botId));
      toast.success(`[SUCCESS] :: Bot configuration removed.`);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-terminus-accent tracking-wider">Telegram Integration</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-terminus-accent text-terminus-bg-primary hover:bg-terminus-accent/90">
              <PlusCircle className="mr-2 h-5 w-5" />
              Configure New Bot
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-terminus-bg-secondary border-terminus-border text-terminus-text-primary">
            <DialogHeader><DialogTitle className="text-terminus-accent">Configure Telegram Bot</DialogTitle></DialogHeader>
            <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
              <Input placeholder="Bot Name (e.g., 'OA Notifier')" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="bg-terminus-bg-primary border-terminus-border h-12" />
              <Input placeholder="Bot Token (from @BotFather)" value={formData.token} onChange={(e) => setFormData({...formData, token: e.target.value})} required className="bg-terminus-bg-primary border-terminus-border h-12" />
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-terminus-accent text-terminus-bg-primary hover:bg-terminus-accent/90">Save Configuration</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="bots" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-terminus-bg-secondary">
          <TabsTrigger value="bots">Bot Management</TabsTrigger>
          <TabsTrigger value="automation" disabled>Automation Rules (WIP)</TabsTrigger>
        </TabsList>
        <TabsContent value="bots" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.map(bot => (
              <Card key={bot.id} className="bg-terminus-bg-secondary border-terminus-border flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-lg text-terminus-accent/90"><Bot/>{bot.name}</CardTitle>
                    <Badge variant={bot.status === 'active' ? 'default' : 'outline'} className={bot.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/50' : ''}>{bot.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-terminus-text-primary/70 font-mono break-all">Token: {bot.token.substring(0, 10)}...
                  </p>
                </CardContent>
                <div className="p-4 flex justify-end gap-2 border-t border-terminus-border">
                    <Button variant="ghost" size="icon" className="text-red-400/70 hover:bg-red-400/10 hover:text-red-400" onClick={() => handleDeleteBot(bot.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="hover:bg-terminus-accent/10 hover:text-terminus-accent">
                        <Settings className="h-4 w-4" />
                    </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
