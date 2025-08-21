"use client"

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { dataService } from '@/lib/data-service';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PlusCircle, Edit, Trash2, ArrowLeft, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define types
type Project = { id: string; name: string; progress: number; [key: string]: any; };
type Task = { id: string; projectId: string; title: string; status: 'planning' | 'active' | 'completed'; assignee: string; priority: 'low' | 'medium' | 'high'; };
type TimeEntry = { id: string; taskId: string; date: string; hours: number; description: string; };

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isTimeFormOpen, setIsTimeFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const initialTaskFormData = {
    title: '',
    assignee: 'Unassigned',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'planning' as 'planning' | 'active' | 'completed',
  };
  const [taskFormData, setTaskFormData] = useState(initialTaskFormData);

  const initialTimeFormData = {
      taskId: '',
      date: new Date().toISOString().split('T')[0],
      hours: 0,
      description: ''
  };
  const [timeFormData, setTimeFormData] = useState(initialTimeFormData);


  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  const loadProjectData = () => {
    const allProjects = dataService.getProjects();
    const currentProject = allProjects.find(p => p.id === projectId) || null;
    setProject(currentProject);

    if (currentProject) {
      const projectTasks = dataService.getTasksByProjectId(projectId);
      setTasks(projectTasks);
      const allTimeEntries = dataService.getTimeEntries();
      setTimeEntries(allTimeEntries.filter((t: TimeEntry) => projectTasks.some(pt => pt.id === t.taskId)));
    }
  };

  const handleTaskFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskFormData.title) {
      toast.error("[VALIDATION_ERROR] :: Task Title is required.");
      return;
    }

    if (editingTask) {
      dataService.updateTask(editingTask.id, { ...editingTask, ...taskFormData });
      toast.success(`[SUCCESS] :: Task "${taskFormData.title}" updated.`);
    } else {
      dataService.addTask({ ...taskFormData, projectId });
      toast.success(`[SUCCESS] :: New task "${taskFormData.title}" created.`);
    }

    loadProjectData();
    setIsTaskFormOpen(false);
    setEditingTask(null);
  };

  const handleTimeFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timeFormData.taskId || timeFormData.hours <= 0) {
      toast.error("[VALIDATION_ERROR] :: Task and positive hours are required.");
      return;
    }
    dataService.addTimeEntry(timeFormData);
    toast.success(`[SUCCESS] :: Time logged for task.`);
    loadProjectData();
    setIsTimeFormOpen(false);
  }

  const openTaskForm = (task: Task | null) => {
    if (task) {
      setEditingTask(task);
      setTaskFormData({
        title: task.title,
        assignee: task.assignee,
        priority: task.priority,
        status: task.status,
      });
    } else {
      setEditingTask(null);
      setTaskFormData(initialTaskFormData);
    }
    setIsTaskFormOpen(true);
  };

  const handleDelete = (taskId: string) => {
    dataService.deleteTask(taskId);
    toast.success(`[SUCCESS] :: Task record terminated.`);
    loadProjectData();
  };

  if (!project) {
    return (
      <div className="text-center">
        <p className="text-terminus-accent">Loading project data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => router.push('/dashboard/projects')} className="text-terminus-text-primary/70 hover:text-terminus-accent">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Project Grid
      </Button>

      <Card className="bg-terminus-bg-secondary border-terminus-border">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-terminus-accent tracking-wider">{project.name}</CardTitle>
          <p className="text-terminus-text-primary/70">{project.description}</p>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center text-sm text-terminus-text-primary/60 mb-1">
            <span>Overall Progress</span>
            <span>{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2 [&>div]:bg-terminus-accent" />
        </CardContent>
      </Card>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-terminus-bg-secondary">
          <TabsTrigger value="tasks">Task Matrix</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks" className="mt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-terminus-accent/90">Tasks</h2>
                <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
                <DialogTrigger asChild>
                    <Button onClick={() => openTaskForm(null)} className="bg-terminus-accent text-terminus-bg-primary hover:bg-terminus-accent/90">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create New Task
                    </Button>
                </DialogTrigger>
                <DialogContent className="bg-terminus-bg-secondary border-terminus-border text-terminus-text-primary">
                    <DialogHeader>
                    <DialogTitle className="text-terminus-accent">{editingTask ? "Update Task Record" : "Create New Task"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleTaskFormSubmit} className="space-y-4 pt-4">
                    <Input placeholder="Task Title" value={taskFormData.title} onChange={(e) => setTaskFormData({...taskFormData, title: e.target.value})} required className="bg-terminus-bg-primary border-terminus-border h-12" />
                    <Input placeholder="Assignee" value={taskFormData.assignee} onChange={(e) => setTaskFormData({...taskFormData, assignee: e.target.value})} required className="bg-terminus-bg-primary border-terminus-border h-12" />
                    <Select value={taskFormData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setTaskFormData({...taskFormData, priority: value})}>
                        <SelectTrigger className="bg-terminus-bg-primary border-terminus-border h-12"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-terminus-bg-secondary border-terminus-border text-terminus-text-primary">
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={taskFormData.status} onValueChange={(value: 'planning' | 'active' | 'completed') => setTaskFormData({...taskFormData, status: value})}>
                        <SelectTrigger className="bg-terminus-bg-primary border-terminus-border h-12"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-terminus-bg-secondary border-terminus-border text-terminus-text-primary">
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsTaskFormOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-terminus-accent text-terminus-bg-primary hover:bg-terminus-accent/90">{editingTask ? "Update Task" : "Create Task"}</Button>
                    </div>
                    </form>
                </DialogContent>
                </Dialog>
            </div>
            <Card className="bg-terminus-bg-secondary border-terminus-border mt-4">
                <CardContent className="p-0">
                <Table>
                    <TableHeader><TableRow className="border-b-terminus-border hover:bg-terminus-bg-primary/5"><TableHead className="text-terminus-accent">Task</TableHead><TableHead className="text-terminus-accent">Assignee</TableHead><TableHead className="text-terminus-accent">Priority</TableHead><TableHead className="text-terminus-accent">Status</TableHead><TableHead className="text-terminus-accent text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                    {tasks.map(task => (
                        <TableRow key={task.id} className="border-b-terminus-border hover:bg-terminus-accent/5">
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>{task.assignee}</TableCell>
                        <TableCell><Badge variant="outline" className={task.priority === 'high' ? 'border-red-400 text-red-400' : task.priority === 'medium' ? 'border-yellow-400 text-yellow-400' : 'border-green-400 text-green-400'}>{task.priority}</Badge></TableCell>
                        <TableCell><Badge variant="outline" className={task.status === 'active' ? 'border-green-400 text-green-400' : task.status === 'completed' ? 'border-terminus-accent text-terminus-accent' : 'border-yellow-400 text-yellow-400'}>{task.status}</Badge></TableCell>
                        <TableCell className="text-right"><div className="flex gap-2 justify-end"><Button variant="ghost" size="icon" onClick={() => openTaskForm(task)} className="hover:bg-terminus-accent/10 hover:text-terminus-accent"><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDelete(task.id)} className="text-red-400/70 hover:bg-red-400/10 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button></div></TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="time" className="mt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-terminus-accent/90">Time Entries</h2>
                 <Dialog open={isTimeFormOpen} onOpenChange={setIsTimeFormOpen}>
                    <DialogTrigger asChild><Button><Clock className="mr-2 h-5 w-5" /> Log Time</Button></DialogTrigger>
                    <DialogContent className="bg-terminus-bg-secondary border-terminus-border text-terminus-text-primary">
                        <DialogHeader><DialogTitle className="text-terminus-accent">Log Time Entry</DialogTitle></DialogHeader>
                        <form onSubmit={handleTimeFormSubmit} className="space-y-4 pt-4">
                            <Select value={timeFormData.taskId} onValueChange={(value) => setTimeFormData({...timeFormData, taskId: value})}><SelectTrigger className="bg-terminus-bg-primary border-terminus-border h-12"><SelectValue placeholder="Select Task" /></SelectTrigger><SelectContent className="bg-terminus-bg-secondary border-terminus-border text-terminus-text-primary">{tasks.map(task => (<SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>))}</SelectContent></Select>
                            <Input type="date" value={timeFormData.date} onChange={(e) => setTimeFormData({...timeFormData, date: e.target.value})} className="bg-terminus-bg-primary border-terminus-border h-12" />
                            <Input type="number" placeholder="Hours" value={timeFormData.hours} onChange={(e) => setTimeFormData({...timeFormData, hours: parseFloat(e.target.value) || 0})} className="bg-terminus-bg-primary border-terminus-border h-12" />
                            <textarea placeholder="Description..." value={timeFormData.description} onChange={(e) => setTimeFormData({...timeFormData, description: e.target.value})} className="bg-terminus-bg-primary border-terminus-border w-full p-2 rounded-md min-h-24" />
                            <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="ghost" onClick={() => setIsTimeFormOpen(false)}>Cancel</Button><Button type="submit" className="bg-terminus-accent text-terminus-bg-primary hover:bg-terminus-accent/90">Log Time</Button></div>
                        </form>
                    </DialogContent>
                 </Dialog>
            </div>
            <Card className="bg-terminus-bg-secondary border-terminus-border mt-4">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader><TableRow className="border-b-terminus-border hover:bg-terminus-bg-primary/5"><TableHead className="text-terminus-accent">Task</TableHead><TableHead className="text-terminus-accent">Date</TableHead><TableHead className="text-terminus-accent">Hours</TableHead><TableHead className="text-terminus-accent">Description</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {timeEntries.map(entry => {
                                const task = tasks.find(t => t.id === entry.taskId);
                                return (<TableRow key={entry.id} className="border-b-terminus-border hover:bg-terminus-accent/5"><TableCell>{task?.title || 'Unknown Task'}</TableCell><TableCell>{entry.date}</TableCell><TableCell>{entry.hours}h</TableCell><TableCell>{entry.description}</TableCell></TableRow>);
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
