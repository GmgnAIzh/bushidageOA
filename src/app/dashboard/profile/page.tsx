"use client"

import { useState, useEffect } from "react"
import { dataService } from "@/lib/data-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { User, Lock, Save, Camera } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type UserProfile = {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    department: string;
    [key: string]: any;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => {
    const currentUser = dataService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setProfileForm({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || '',
      });
    }
  }, []);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updatedUser = { ...user, ...profileForm };
    dataService.updateUser(user.id, updatedUser);
    dataService.setCurrentUser(updatedUser);
    setUser(updatedUser);
    toast.success("[SUCCESS] :: Profile information updated.");
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.newPassword) {
        toast.error("[VALIDATION_ERROR] :: New password cannot be empty.");
        return;
    }
    // In a real app, you would verify the current password here.
    toast.success("[SUCCESS] :: Password has been changed.");
    setPasswordForm({ currentPassword: '', newPassword: '' });
  };

  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-terminus-accent">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-3xl bg-terminus-bg-secondary">{user.name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
                <h1 className="text-4xl font-bold text-terminus-accent tracking-wider">{user.name}</h1>
                <p className="text-terminus-text-primary/70 text-lg">{user.role} - {user.department}</p>
            </div>
        </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-terminus-bg-secondary">
          <TabsTrigger value="profile">Profile Details</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card className="bg-terminus-bg-secondary border-terminus-border">
            <CardHeader><CardTitle className="flex items-center gap-2"><User /> Edit Profile</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div><Label>Name</Label><Input value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} className="bg-terminus-bg-primary border-terminus-border h-12" /></div>
                    <div><Label>Email</Label><Input type="email" value={profileForm.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} className="bg-terminus-bg-primary border-terminus-border h-12" /></div>
                    <div><Label>Phone</Label><Input value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} className="bg-terminus-bg-primary border-terminus-border h-12" /></div>
                    <div><Label>Role</Label><Input value={user.role} disabled className="bg-terminus-bg-primary/50 border-terminus-border h-12" /></div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="bg-terminus-accent text-terminus-bg-primary hover:bg-terminus-accent/90"><Save className="mr-2 h-5 w-5" /> Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card className="bg-terminus-bg-secondary border-terminus-border">
            <CardHeader><CardTitle className="flex items-center gap-2"><Lock /> Change Password</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <Input type="password" placeholder="Current Password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})} className="bg-terminus-bg-primary border-terminus-border h-12" />
                <Input type="password" placeholder="New Password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="bg-terminus-bg-primary border-terminus-border h-12" />
                <div className="flex justify-end">
                  <Button type="submit" className="bg-terminus-accent text-terminus-bg-primary hover:bg-terminus-accent/90"><Save className="mr-2 h-5 w-5" /> Update Password</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
