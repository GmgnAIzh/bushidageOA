"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FolderGit2, AlertTriangle, ShieldCheck } from "lucide-react";

const stats = [
  { title: "Active Connections", value: "142", icon: Users, color: "text-terminus-accent" },
  { title: "Running Processes", value: "8", icon: FolderGit2, color: "text-green-400" },
  { title: "System Warnings", value: "3", icon: AlertTriangle, color: "text-yellow-400" },
  { title: "Security Status", value: "SECURE", icon: ShieldCheck, color: "text-green-400" },
];

export default function DashboardPage() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-terminus-accent mb-2">SYSTEM DASHBOARD</h1>
      <p className="text-terminus-text-primary/70 mb-8">
        Welcome to the BushidageOA secure environment. All systems are nominal.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="bg-terminus-bg-secondary border-terminus-border hover:border-terminus-accent transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-terminus-text-primary/80">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-4xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <p className="text-xs text-terminus-text-primary/50 mt-1">
                  Real-time system metric
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8">
        <Card className="bg-terminus-bg-secondary border-terminus-border">
          <CardHeader>
            <CardTitle className="text-terminus-accent/90">SYSTEM LOG</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-sm text-green-400 h-64 overflow-y-auto bg-black/20 p-4 rounded-md">
              <p>&gt; [2025-08-19 19:10:02] System initialized successfully.</p>
              <p>&gt; [2025-08-19 19:10:03] User 'admin' authenticated from 127.0.0.1.</p>
              <p>&gt; [2025-08-19 19:10:04] Dashboard module loaded.</p>
              <p>&gt; [2025-08-19 19:10:05] Checking system integrity... OK.</p>
              <p className="animate-pulse">&gt; _</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
