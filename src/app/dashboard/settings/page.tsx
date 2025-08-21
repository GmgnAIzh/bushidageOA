"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Settings, Building, Shield, Database, Save } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
  const [systemSettings, setSystemSettings] = useState({
    companyName: 'Project Terminus',
    systemName: 'BushidageOA v2.0',
    allowRegistration: false,
    require2FA: true,
  });

  useEffect(() => {
    // Load settings from localStorage if they exist
    const savedSettings = localStorage.getItem('system_settings');
    if (savedSettings) {
      setSystemSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('system_settings', JSON.stringify(systemSettings));
    toast.success("[SUCCESS] :: System settings have been updated.");
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-terminus-accent tracking-wider">System Configuration</h1>

      <Tabs defaultValue="system" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-terminus-bg-secondary">
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="security" disabled>Security (WIP)</TabsTrigger>
          <TabsTrigger value="api" disabled>API (WIP)</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="mt-6">
          <Card className="bg-terminus-bg-secondary border-terminus-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Settings /> System Settings</CardTitle>
              <CardDescription>Configure core system parameters and feature flags.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-terminus-border rounded-md">
                <div>
                  <Label>Allow New User Registration</Label>
                  <p className="text-sm text-terminus-text-primary/60">Allow users to sign up for accounts themselves.</p>
                </div>
                <Switch
                  checked={systemSettings.allowRegistration}
                  onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, allowRegistration: checked }))}
                  className="data-[state=checked]:bg-terminus-accent"
                />
              </div>
              <div className="flex items-center justify-between p-4 border border-terminus-border rounded-md">
                <div>
                  <Label>Require Two-Factor Authentication</Label>
                  <p className="text-sm text-terminus-text-primary/60">Force all users to set up and use 2FA.</p>
                </div>
                <Switch
                  checked={systemSettings.require2FA}
                  onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, require2FA: checked }))}
                   className="data-[state=checked]:bg-terminus-accent"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="mt-6">
          <Card className="bg-terminus-bg-secondary border-terminus-border">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building/> Company Information</CardTitle>
                <CardDescription>Set the company details for the system.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={systemSettings.companyName}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, companyName: e.target.value }))}
                  className="bg-terminus-bg-primary border-terminus-border h-12"
                />
              </div>
              <div>
                <Label htmlFor="systemName">System Name</Label>
                <Input
                  id="systemName"
                  value={systemSettings.systemName}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, systemName: e.target.value }))}
                  className="bg-terminus-bg-primary border-terminus-border h-12"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="bg-terminus-accent text-terminus-bg-primary hover:bg-terminus-accent/90">
          <Save className="mr-2 h-5 w-5" />
          Save All Settings
        </Button>
      </div>
    </div>
  )
}
