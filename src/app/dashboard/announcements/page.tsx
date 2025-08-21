"use client"

import { useState, useEffect, useMemo } from "react"
import { dataService } from "@/lib/data-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { PlusCircle, Megaphone, AlertTriangle, Bell } from "lucide-react"

// Define types
type Announcement = {
  id: string;
  title: string;
  content: string;
  author: string;
  publishTime: string;
  priority: 'low' | 'normal' | 'high';
  [key: string]: any;
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const initialFormData = {
    title: '',
    content: '',
    priority: 'normal' as 'low' | 'normal' | 'high',
  };
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    dataService.initializeData();
    loadAnnouncements();
  }, [])

  const loadAnnouncements = () => {
    const allAnnouncements = dataService.getAnnouncements();
    setAnnouncements(allAnnouncements);
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error("[VALIDATION_ERROR] :: Title and Content are required.");
      return;
    }

    const newAnnouncement = {
      ...formData,
      id: dataService.generateId(),
      author: "System Administrator", // Mock author
      publishTime: new Date().toISOString(),
      readCount: 0,
    };

    const updatedAnnouncements = [newAnnouncement, ...dataService.getAnnouncements()];
    dataService.saveAnnouncements(updatedAnnouncements);

    toast.success(`[SUCCESS] :: Announcement "${formData.title}" published.`);
    loadAnnouncements();
    setIsFormOpen(false);
    setFormData(initialFormData);
  }

  const getPriorityBadge = (priority: Announcement['priority']) => {
      switch (priority) {
          case 'high': return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/50"><AlertTriangle className="h-3 w-3 mr-1" /> High</Badge>;
          case 'normal': return <Badge variant="outline" className="border-yellow-500/50 text-yellow-400"><Bell className="h-3 w-3 mr-1" /> Normal</Badge>;
          case 'low': return <Badge variant="outline" className="border-gray-500/50 text-gray-400">Low</Badge>;
          default: return null;
      }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-terminus-accent tracking-wider">System Broadcasts</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-terminus-accent text-terminus-bg-primary hover:bg-terminus-accent/90">
              <PlusCircle className="mr-2 h-5 w-5" />
              New Broadcast
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-terminus-bg-secondary border-terminus-border text-terminus-text-primary">
            <DialogHeader><DialogTitle className="text-terminus-accent">Compose New Broadcast</DialogTitle></DialogHeader>
            <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
              <Input placeholder="Broadcast Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required className="bg-terminus-bg-primary border-terminus-border h-12" />
              <textarea placeholder="Broadcast Content..." value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} required className="bg-terminus-bg-primary border-terminus-border w-full p-2 rounded-md min-h-36" />
              <Select value={formData.priority} onValueChange={(value: 'low' | 'normal' | 'high') => setFormData({...formData, priority: value})}>
                <SelectTrigger className="bg-terminus-bg-primary border-terminus-border h-12"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-terminus-bg-secondary border-terminus-border text-terminus-text-primary">
                  <SelectItem value="low">Priority: Low</SelectItem>
                  <SelectItem value="normal">Priority: Normal</SelectItem>
                  <SelectItem value="high">Priority: High</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-terminus-accent text-terminus-bg-primary hover:bg-terminus-accent/90">Publish</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {announcements.map(item => (
          <Card key={item.id} className="bg-terminus-bg-secondary border-terminus-border">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-terminus-accent/90">{item.title}</CardTitle>
                    {getPriorityBadge(item.priority)}
                </div>
                <CardDescription className="text-xs text-terminus-text-primary/50">
                    BROADCAST BY: {item.author} // {new Date(item.publishTime).toLocaleString()}
                </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-terminus-text-primary/80 line-clamp-2">{item.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
