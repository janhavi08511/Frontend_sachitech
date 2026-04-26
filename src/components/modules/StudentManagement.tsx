import React, { useEffect, useState } from "react";
import { getAllStudents, addStudentInfo } from "../../api/studentApi";
import API from "../../api/axios";
import { getAllFeeRecords } from "../../api/feeApi";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "../ui/table";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogDescription
} from "../ui/dialog";

import { GraduationCap, Phone, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Props {
  role?: string;
}

export function StudentManagement({ role }: Props) {
  const isTrainer = role === "trainer" || role === "TRAINER";

  const [students, setStudents] = useState<any[]>([]);
  const [feeRecords, setFeeRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    phone: "",
    course: "",
    admissiondate: ""
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Trainers use their own scoped endpoint; admins/managers use the full list
      const studentsPromise = isTrainer
        ? API.get("/api/trainer/students").then(r => r.data)
        : getAllStudents();

      // Get fee records for display
      const feePromise = isTrainer
        ? Promise.resolve([])
        : getAllFeeRecords();

      const [studentsRes, feeRes] = await Promise.all([studentsPromise, feePromise]);

      setStudents(Array.isArray(studentsRes) ? studentsRes : studentsRes?.data || []);
      setFeeRecords(Array.isArray(feeRes) ? feeRes : feeRes?.data || []);

    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedId) return;

    try {
      await addStudentInfo(selectedId, formData);
      toast.success("Updated successfully");
      setIsOpen(false);
      fetchAll();
    } catch {
      toast.error("Update failed");
    }
  };

  const filtered = students.filter((s) =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create fee map for quick lookup
  const feeMap: Record<number, any> = {};
  feeRecords.forEach((f: any) => {
    if (!feeMap[f.studentId]) {
      feeMap[f.studentId] = f;
    }
  });

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <h1 className="text-2xl font-bold flex gap-2 items-center">
        <GraduationCap className="text-indigo-600" />
        Student Management
      </h1>

      {/* SEARCH */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search by name..."
          className="w-full md:w-64"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* STUDENTS TABLE */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Name</TableHead>
                  <TableHead className="min-w-[120px]">Phone</TableHead>
                  <TableHead className="min-w-[120px]">Course</TableHead>
                  <TableHead className="min-w-[100px]">Fee Status</TableHead>
                  <TableHead className="min-w-[120px]">Admission</TableHead>
                  <TableHead className="min-w-[80px]">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : [...filtered].reverse().map((s) => {

                    const fee = feeMap[s.id];
                    const progress = fee && fee.totalFeeAtEnrollment > 0
                      ? Math.round((fee.amountPaid / fee.totalFeeAtEnrollment) * 100)
                      : 0;

                    return (
                      <TableRow key={s.id}>

                        <TableCell className="font-medium">{s.name}</TableCell>

                        <TableCell>
                          <Phone className="inline w-3 h-3 mr-1"/>
                          {s.phone || "N/A"}
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline">{s.course || "N/A"}</Badge>
                        </TableCell>

                        <TableCell>
                          {fee ? (
                            <div className="w-24 space-y-1">
                              <Progress value={progress}/>
                              <p className="text-xs text-muted-foreground">{progress}%</p>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">No fees</span>
                          )}
                        </TableCell>

                        <TableCell>
                          <Calendar className="inline w-3 h-3 mr-1"/>
                          {s.admissiondate || "N/A"}
                        </TableCell>

                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedId(s.id);
                              setFormData({
                                phone: s.phone || "",
                                course: s.course || "",
                                admissiondate: s.admissiondate || ""
                              });
                              setIsOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                        </TableCell>

                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* UPDATE DIALOG */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-full max-w-md">

          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update student details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">

            <Input
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />

            <Input
              placeholder="Course"
              value={formData.course}
              onChange={(e) =>
                setFormData({ ...formData, course: e.target.value })
              }
            />

            <Input
              type="date"
              value={formData.admissiondate}
              onChange={(e) =>
                setFormData({ ...formData, admissiondate: e.target.value })
              }
            />

          </div>

          <DialogFooter>
            <Button onClick={handleUpdate} className="w-full">
              Save Changes
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>

    </div>
  );
}