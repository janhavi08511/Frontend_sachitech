import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '../ui/dialog';
import { toast, Toaster } from 'sonner';

import { getCourses, createCourse, deleteCourse } from "../../api/courseApi";

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

            <CardHeader className="flex justify-between items-center">
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