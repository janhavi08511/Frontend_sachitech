import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Plus, Clock, BookOpen, Layers, Trash2, Calendar } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription
} from '../ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../ui/table';
import { toast, Toaster } from 'sonner';

import { getCourses, createCourse, deleteCourse } from "../../api/courseApi";
import { getBatches, createBatch, deleteBatch } from "../../api/batchApi";
import { getTrainers } from "../../api/userapi";

export function CourseManagement() {
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);

  const [courseFormData, setCourseFormData] = useState({
    name: '', description: '', duration: '', category: '', totalFee: '',
  });

  const [batchFormData, setBatchFormData] = useState({
    name: '', courseId: '', trainerId: '', startDate: '', endDate: '',
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cData, bData, tData] = await Promise.all([
        getCourses().catch(() => []), 
        getBatches().catch(() => []), 
        getTrainers().catch(() => [])
      ]);
      setCourses(Array.isArray(cData) ? cData : []);
      setBatches(Array.isArray(bData) ? bData : []);
      setTrainers(Array.isArray(tData) ? tData : []);
    } catch (err) {
      toast.error("Database connection failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    // ✅ Validation: Check for duplicates before sending to API
    const isDuplicate = courses.some(
      (c) => c.name.toLowerCase().trim() === courseFormData.name.toLowerCase().trim()
    );

    if (isDuplicate) {
      toast.error(`"${courseFormData.name}" already exists!`);
      return;
    }

    if (!courseFormData.name.trim()) {
      toast.error("Course name is required");
      return;
    }

    try {
      const newCourse = await createCourse({ 
        ...courseFormData, 
        totalFee: parseFloat(courseFormData.totalFee || "0") 
      });
      setCourses(prev => [...prev, newCourse]); // ✅ Forced UI Update
      toast.success("Course added successfully");
      setIsCourseDialogOpen(false);
      setCourseFormData({ name: '', description: '', duration: '', category: '', totalFee: '' });
    } catch (err) { toast.error("Failed to save course"); }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!window.confirm("Delete this course and all linked batches?")) return;
    try {
      await deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
      toast.success("Course deleted");
    } catch (err) { toast.error("Error deleting course"); }
  };

  const handleCreateBatch = async () => {
    if (!batchFormData.courseId || !batchFormData.trainerId) {
      toast.error("Assign course and trainer");
      return;
    }
    try {
      await createBatch(
        { name: batchFormData.name, startDate: batchFormData.startDate, endDate: batchFormData.endDate },
        Number(batchFormData.courseId),
        Number(batchFormData.trainerId)
      );
      toast.success("Batch scheduled");
      loadData();
      setIsBatchDialogOpen(false);
    } catch (err) { toast.error("Failed to create batch"); }
  };

  const handleDeleteBatch = async (id: number) => {
    if (!window.confirm("Delete this batch?")) return;
    try {
      await deleteBatch(id);
      setBatches(prev => prev.filter(b => b.id !== id));
      toast.success("Batch removed");
    } catch (err) { toast.error("Error deleting batch"); }
  };

  const groupedCourses = courses.reduce((acc, course) => {
    const cat = course?.category?.trim() || "General Certification";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(course);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen space-y-8">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <BookOpen className="text-indigo-600 w-8 h-8" /> Academic Catalog
          </h1>
          <p className="text-slate-500 text-sm">Total Courses: {courses.length}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setIsCourseDialogOpen(true)} variant="outline"><Plus className="w-4 h-4 mr-2" /> Course</Button>
          <Button onClick={() => setIsBatchDialogOpen(true)} className="bg-indigo-600"><Plus className="w-4 h-4 mr-2" /> Batch</Button>
        </div>
      </div>

      <Tabs defaultValue="catalog">
        <TabsList className="bg-slate-200/50 p-1 mb-6 rounded-xl w-64">
          <TabsTrigger value="catalog" className="rounded-lg font-bold py-2">Catalog</TabsTrigger>
          <TabsTrigger value="schedules" className="rounded-lg font-bold py-2">Schedules</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog">
          {courses.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed rounded-3xl text-slate-400">
              No courses found.
            </div>
          ) : (
            (Object.entries(groupedCourses) as [string, any[]][]).map(([category, catCourses], gIdx) => (
              <div key={`section-${category}-${gIdx}`} className="mb-12">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 border-l-4 border-indigo-600 pl-3">
                  {category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...catCourses].reverse().map((course: any, cIdx: number) => (
                    <Card key={`course-${course.id}-${cIdx}`} className="border-none shadow-xl rounded-3xl overflow-hidden hover:-translate-y-1 transition-all">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                           <Badge className="bg-emerald-50 text-emerald-700">₹{course.totalFee || 0}</Badge>
                           <Button variant="ghost" size="icon" className="text-slate-300 hover:text-rose-600 h-8 w-8" onClick={() => handleDeleteCourse(course.id)}>
                             <Trash2 className="w-4 h-4" />
                           </Button>
                        </div>
                        <CardTitle className="text-xl font-bold mt-4">{course.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-500 mb-6">{course.description || "No description provided."}</p>
                        <div className="space-y-2 border-t pt-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Live Tracks</p>
                          {batches.filter(b => b.course?.id === course.id).map((b, bIdx) => (
                            <div key={`rel-batch-${b.id}-${bIdx}`} className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border">
                               <span className="text-xs font-bold text-slate-700">{b.name}</span>
                               <Badge variant="outline" className="text-[9px] uppercase font-bold text-indigo-500 bg-indigo-50">{b.status}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="schedules">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="pl-6 font-bold text-[10px] uppercase text-slate-500">Batch Name</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-500">Course</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-500 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...batches].reverse().map((b: any, bIdx: number) => (
                  <TableRow key={`table-batch-${b.id}-${bIdx}`} className="hover:bg-slate-50/50">
                    <TableCell className="pl-6 font-bold py-4 text-slate-800">{b.name}</TableCell>
                    <TableCell><Badge variant="outline" className="font-medium">{b.course?.name || "Unassigned"}</Badge></TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="icon" className="text-slate-300 hover:text-rose-600" onClick={() => handleDeleteBatch(b.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIALOGS REMAIN SAME */}
      <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Course</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <Input placeholder="Course Title" value={courseFormData.name} onChange={e => setCourseFormData({...courseFormData, name: e.target.value})} />
            <Input placeholder="Category" value={courseFormData.category} onChange={e => setCourseFormData({...courseFormData, category: e.target.value})} />
            <Input placeholder="Duration" value={courseFormData.duration} onChange={e => setCourseFormData({...courseFormData, duration: e.target.value})} />
            <Input type="number" placeholder="Total Fees" value={courseFormData.totalFee} onChange={e => setCourseFormData({...courseFormData, totalFee: e.target.value})} />
            <textarea className="w-full border rounded-md p-2 text-sm" placeholder="Description" onChange={e => setCourseFormData({...courseFormData, description: e.target.value})} />
          </div>
          <DialogFooter><Button onClick={handleCreateCourse} className="w-full bg-indigo-600">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Batch</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <Input placeholder="Batch Name" value={batchFormData.name} onChange={e => setBatchFormData({ ...batchFormData, name: e.target.value })} />
            <Select onValueChange={v => setBatchFormData({ ...batchFormData, courseId: v })}>
              <SelectTrigger><SelectValue placeholder="Assign Course" /></SelectTrigger>
              <SelectContent>{courses.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select onValueChange={v => setBatchFormData({ ...batchFormData, trainerId: v })}>
              <SelectTrigger><SelectValue placeholder="Select Trainer" /></SelectTrigger>
              <SelectContent>
                {trainers.filter((u: any) => u.role === "TRAINER").map((t: any) => (
                  <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-4">
               <Input type="date" onChange={e => setBatchFormData({ ...batchFormData, startDate: e.target.value })} />
               <Input type="date" onChange={e => setBatchFormData({ ...batchFormData, endDate: e.target.value })} />
            </div>
          </div>
          <DialogFooter><Button onClick={handleCreateBatch} className="w-full bg-indigo-600">Schedule</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}