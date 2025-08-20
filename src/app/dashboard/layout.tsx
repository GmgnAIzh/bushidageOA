"use client"

import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home, MessageSquare, FolderOpen, DollarSign, Users, FileCheck, BarChart3, Settings, LogOut, Terminal, ChevronLeft, ChevronRight
} from "lucide-react";
import { useRouter } from 'next/navigation';

const modules = [
  { id: 'home', name: 'Dashboard', icon: Home },
  { id: 'chat', name: 'Secure Chat', icon: MessageSquare },
  { id: 'projects', name: 'Projects', icon: FolderOpen },
  { id: 'finance', name: 'Finance', icon: DollarSign },
  { id: 'hr', name: 'HR', icon: Users },
  { id: 'approvals', name: 'Approvals', icon: FileCheck },
  { id: 'reports', name: 'Reports', icon: BarChart3 },
  { id: 'settings', name: 'Settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState('home');
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('oa_current_user');
    router.push('/');
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen bg-terminus-bg-primary text-terminus-text-primary">
        {/* Sidebar */}
        <nav className={`flex flex-col border-r border-terminus-border transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
          <div className="flex items-center justify-center h-20 border-b border-terminus-border">
             <Terminal size={32} className="text-terminus-accent" />
             {!isSidebarCollapsed && <span className="ml-2 text-lg font-bold tracking-widest">BUSHIDAGE</span>}
          </div>
          <div className="flex-1 overflow-y-auto py-4 space-y-2">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Tooltip key={module.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeModule === module.id ? 'secondary' : 'ghost'}
                      className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start'} h-12`}
                      onClick={() => {
                        setActiveModule(module.id);
                        router.push(`/dashboard/${module.id}`);
                      }}
                    >
                      <Icon className="h-6 w-6 text-terminus-accent" />
                      {!isSidebarCollapsed && <span className="ml-4">{module.name}</span>}
                    </Button>
                  </TooltipTrigger>
                  {isSidebarCollapsed && <TooltipContent side="right"><p>{module.name}</p></TooltipContent>}
                </Tooltip>
              );
            })}
          </div>
          <div className="mt-auto p-4 border-t border-terminus-border">
             <div className="flex items-center justify-between">
                {!isSidebarCollapsed && (
                    <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10 border-2 border-terminus-accent">
                            <AvatarFallback>A</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-bold">Admin</p>
                            <p className="text-xs text-terminus-text-primary/60">System Operator</p>
                        </div>
                    </div>
                )}
                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-terminus-text-primary/60 hover:text-terminus-warning">
                  <LogOut className="h-6 w-6" />
                </Button>
             </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <header className="flex items-center justify-between h-20 border-b border-terminus-border px-8">
            <h1 className="text-2xl font-bold tracking-wider">
              {modules.find(m => m.id === activeModule)?.name}
            </h1>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
              {isSidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </Button>
          </header>
          <main className="flex-1 overflow-y-auto p-8">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
