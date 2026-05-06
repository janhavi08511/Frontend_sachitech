import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Plus, Trash2, BookOpen,
  Code2, Database, Globe, Shield, Cpu, BarChart2,
  Smartphone, Cloud, BrainCircuit, PenTool, Layers,
  Network, Terminal, FlaskConical, Figma, GitBranch,
  MonitorSmartphone, Server, Lock, Wifi, Bot,
  Calculator, Microscope, Palette, Music, Camera,
  FileText, Briefcase, TrendingUp, Users, Wrench,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '../ui/dialog';
import { toast, Toaster } from 'sonner';

import { getCourses, createCourse, deleteCourse } from "../../api/courseApi";

// ── Icon picker: maps course name/category keywords → icon + color ────────────
const COURSE_ICONS: { keywords: string[]; icon: React.ElementType; bg: string; color: string }[] = [
  { keywords: ['python', 'django', 'flask'],          icon: Code2,           bg: 'bg-yellow-100', color: 'text-yellow-600' },
  { keywords: ['java', 'spring', 'kotlin'],           icon: Terminal,        bg: 'bg-orange-100', color: 'text-orange-600' },
  { keywords: ['javascript', 'js', 'node', 'react', 'vue', 'angular', 'typescript', 'ts'], icon: Globe, bg: 'bg-blue-100', color: 'text-blue-600' },
  { keywords: ['web', 'html', 'css', 'frontend', 'fullstack', 'full stack', 'full-stack'], icon: MonitorSmartphone, bg: 'bg-cyan-100', color: 'text-cyan-600' },
  { keywords: ['database', 'sql', 'mysql', 'mongo', 'postgres', 'oracle', 'nosql'],       icon: Database,        bg: 'bg-indigo-100', color: 'text-indigo-600' },
  { keywords: ['cloud', 'aws', 'azure', 'gcp', 'devops', 'docker', 'kubernetes'],         icon: Cloud,           bg: 'bg-sky-100',    color: 'text-sky-600' },
  { keywords: ['security', 'cyber', 'ethical hacking', 'penetration', 'network security'], icon: Shield,         bg: 'bg-red-100',    color: 'text-red-600' },
  { keywords: ['machine learning', 'ml', 'deep learning', 'dl', 'neural', 'ai', 'artificial intelligence'], icon: BrainCircuit, bg: 'bg-purple-100', color: 'text-purple-600' },
  { keywords: ['data science', 'data analytics', 'analytics', 'tableau', 'power bi'],     icon: BarChart2,       bg: 'bg-green-100',  color: 'text-green-600' },
  { keywords: ['mobile', 'android', 'ios', 'flutter', 'react native'],                    icon: Smartphone,      bg: 'bg-pink-100',   color: 'text-pink-600' },
  { keywords: ['networking', 'ccna', 'cisco', 'router', 'switch', 'tcp', 'ip'],           icon: Network,         bg: 'bg-teal-100',   color: 'text-teal-600' },
  { keywords: ['hardware', 'embedded', 'iot', 'arduino', 'raspberry'],                    icon: Cpu,             bg: 'bg-amber-100',  color: 'text-amber-600' },
  { keywords: ['testing', 'qa', 'selenium', 'automation', 'manual testing'],              icon: FlaskConical,    bg: 'bg-lime-100',   color: 'text-lime-600' },
  { keywords: ['ui', 'ux', 'design', 'figma', 'adobe', 'photoshop', 'illustrator'],       icon: Figma,           bg: 'bg-rose-100',   color: 'text-rose-600' },
  { keywords: ['git', 'github', 'version control', 'agile', 'scrum'],                     icon: GitBranch,       bg: 'bg-gray-100',   color: 'text-gray-600' },
  { keywords: ['server', 'linux', 'unix', 'bash', 'shell'],                               icon: Server,          bg: 'bg-slate-100',  color: 'text-slate-600' },
  { keywords: ['blockchain', 'crypto', 'web3', 'solidity'],                               icon: Lock,            bg: 'bg-violet-100', color: 'text-violet-600' },
  { keywords: ['wireless', 'wifi', '5g', 'telecom'],                                      icon: Wifi,            bg: 'bg-blue-100',   color: 'text-blue-500' },
  { keywords: ['robot', 'automation', 'rpa', 'chatbot'],                                  icon: Bot,             bg: 'bg-emerald-100',color: 'text-emerald-600' },
  { keywords: ['math', 'statistics', 'calculus', 'algebra'],                              icon: Calculator,      bg: 'bg-yellow-100', color: 'text-yellow-700' },
  { keywords: ['science', 'physics', 'chemistry', 'biology', 'lab'],                     icon: Microscope,      bg: 'bg-green-100',  color: 'text-green-700' },
  { keywords: ['art', 'graphic', 'creative', 'illustration', 'sketch'],                  icon: Palette,         bg: 'bg-fuchsia-100',color: 'text-fuchsia-600' },
  { keywords: ['music', 'audio', 'sound'],                                                icon: Music,           bg: 'bg-pink-100',   color: 'text-pink-500' },
  { keywords: ['photo', 'video', 'media', 'film', 'editing'],                             icon: Camera,          bg: 'bg-orange-100', color: 'text-orange-500' },
  { keywords: ['business', 'management', 'mba', 'finance', 'accounting'],                icon: Briefcase,       bg: 'bg-blue-100',   color: 'text-blue-700' },
  { keywords: ['marketing', 'seo', 'digital marketing', 'social media'],                 icon: TrendingUp,      bg: 'bg-green-100',  color: 'text-green-500' },
  { keywords: ['hr', 'human resource', 'recruitment', 'soft skill'],                     icon: Users,           bg: 'bg-indigo-100', color: 'text-indigo-500' },
  { keywords: ['mechanical', 'civil', 'electrical', 'engineering'],                      icon: Wrench,          bg: 'bg-stone-100',  color: 'text-stone-600' },
  { keywords: ['stack', 'framework', 'architecture', 'microservice'],                    icon: Layers,          bg: 'bg-cyan-100',   color: 'text-cyan-700' },
  { keywords: ['content', 'writing', 'documentation', 'technical writing'],              icon: FileText,        bg: 'bg-gray-100',   color: 'text-gray-500' },
];

const DEFAULT_ICON = { icon: BookOpen, bg: 'bg-blue-100', color: 'text-blue-600' };

function getCourseIcon(name: string, category: string) {
  const haystack = `${name} ${category}`.toLowerCase();
  for (const entry of COURSE_ICONS) {
    if (entry.keywords.some(kw => haystack.includes(kw))) {
      return entry;
    }
  }
  return DEFAULT_ICON;
}

export function CourseManagement() {

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    duration: "",
    description: "",
    totalFee: ""
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await getCourses();
      setCourses(res || []);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  // ================= VALIDATION =================
  const isValid =
    form.name.trim() &&
    form.duration.trim() &&
    Number(form.totalFee) > 0;

  // ================= CREATE =================
  const handleCreate = async () => {

    if (!form.name.trim()) {
      toast.error("Course name required");
      return;
    }

    if (!form.duration.trim()) {
      toast.error("Duration required");
      return;
    }

    if (Number(form.totalFee) <= 0) {
      toast.error("Fee must be greater than 0");
      return;
    }

    const duplicate = courses.some(
      c => c.name.toLowerCase() === form.name.toLowerCase()
    );

    if (duplicate) {
      toast.error("Course already exists");
      return;
    }

    try {
      const newCourse = await createCourse({
        ...form,
        totalFee: Number(form.totalFee)
      });

      setCourses(prev => [newCourse, ...prev]);

      toast.success("Course created");

      setOpen(false);
      setForm({
        name: "",
        category: "",
        duration: "",
        description: "",
        totalFee: ""
      });

    } catch {
      toast.error("Failed to create course");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id: number) => {
    try {
      await deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
      toast.success("Course deleted");
    } catch (error: any) {
      const msg = error?.response?.data?.error || "Failed to delete course";
      toast.error(msg);
    }
  };

  return (
    <div className="p-6 bg-[#fbfff1] min-h-screen space-y-6">

      <Toaster />

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#3c3744] flex gap-2 items-center">
          <BookOpen /> Course Management
        </h1>

        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </Button>
      </div>

      {/* COURSE LIST */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {loading ? (
          <p>Loading...</p>
        ) : courses.length === 0 ? (
          <p className="text-gray-400">No courses found</p>
        ) : courses.map(c => (

          <Card key={c.id} className="rounded-2xl shadow hover:shadow-lg transition">

            <CardHeader className="flex flex-row justify-between items-start pb-2">

              {/* TOP-LEFT: course icon */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${getCourseIcon(c.name, c.category).bg}`}>
                {React.createElement(getCourseIcon(c.name, c.category).icon, {
                  className: `w-5 h-5 ${getCourseIcon(c.name, c.category).color}`
                })}
              </div>

              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-700">
                  ₹ {c.totalFee}
                </Badge>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(c.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>

            </CardHeader>

            <CardContent>
              <h2 className="font-bold text-lg">{c.name}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {c.description || "No description"}
              </p>

              <div className="flex justify-between mt-3 text-sm">
                <span>⏱ {c.duration}</span>
                <span>{c.category || "General"}</span>
              </div>
            </CardContent>

          </Card>
        ))}

      </div>

      {/* CREATE COURSE DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">

          <DialogHeader>
            <DialogTitle>Create Course</DialogTitle>
            <DialogDescription>
              Fill details and preview before submit
            </DialogDescription>
          </DialogHeader>

          {/* FORM */}
          <div className="grid grid-cols-2 gap-4 mt-4">

            <Input
              placeholder="Course Name *"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />

            <Input
              placeholder="Category"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
            />

            <Input
              placeholder="Duration *"
              value={form.duration}
              onChange={e => setForm({ ...form, duration: e.target.value })}
            />

            <Input
              type="number"
              placeholder="Fee *"
              value={form.totalFee}
              onChange={e => setForm({ ...form, totalFee: e.target.value })}
            />

            <div className="col-span-2">
              <textarea
                placeholder="Description"
                className="w-full border rounded-lg p-3"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* PREVIEW */}
            <div className="col-span-2">
              <p className="text-sm font-semibold mb-2">Preview</p>

              <div className="border p-4 rounded-xl bg-gray-50">
                <h3 className="font-bold text-lg">
                  {form.name || "Course Name"}
                </h3>

                <p className="text-sm text-gray-500">
                  {form.description || "No description"}
                </p>

                <div className="flex justify-between mt-2 text-sm">
                  <span>{form.duration || "Duration"}</span>
                  <span className="text-green-600 font-semibold">
                    ₹ {form.totalFee || 0}
                  </span>
                </div>
              </div>
            </div>

          </div>

          <DialogFooter>
            <Button
              className="w-full bg-[#090c9b]"
              disabled={!isValid}
              onClick={handleCreate}
            >
              Create Course
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>

    </div>
  );
}