import { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";

import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "../ui/table";

import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter
} from "../ui/dialog";

import {
  getUsers, createUser, deleteUser,
  createStudentProfile, createTrainerProfile,
  resetPassword, enrollStudentWithInitialPayment,
  recordTrainerPayment
} from "../../api/userapi";

import { getCourses } from "../../api/courseApi";
import { getBatches } from "../../api/batchApi";
import { getAllInternships } from "../../api/internshipApi";
import { updateTrainerProfile } from "../../api/trainerApi";

export function UserManagement() {

  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);

  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
    phone: "",
    specialization: "",
    courses: [] as string[],
    internships: [] as string[],
    admissionDate: "",
    initialPayment: "",
    salary: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [u, c, b, i] = await Promise.all([
      getUsers(),
      getCourses(),
      getBatches(),
      getAllInternships()
    ]);

    setUsers(Array.isArray(u) ? u : u?.data || []);
    setCourses(Array.isArray(c) ? c : c?.data || []);
    setBatches(Array.isArray(b) ? b : b?.data || []);
    setInternships(Array.isArray(i) ? i : i?.data || []);
  };

  const toggle = (list: string[], value: string) =>
    list.includes(value)
      ? list.filter(v => v !== value)
      : [...list, value];

  // 🚀 MAIN CREATE FUNCTION (FIXED)
  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error("Name, Email, Password required");
      return;
    }

    try {
      // 1. CREATE USER
      const userRes = await createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role
      });

      const userId = userRes?.data?.id;

      // ======================
      // STUDENT FLOW
      // ======================
      if (form.role === "STUDENT" && userId) {

        const profileRes = await createStudentProfile({
          user: { id: userId },
          phone: form.phone,
          course: form.courses.join(","), // backend expects string
          admissionDate: form.admissionDate || null
        });

        const studentId = profileRes?.data?.id;

        if (form.initialPayment && studentId && form.courses.length > 0) {
          await enrollStudentWithInitialPayment({
            studentId: studentId,
            courseId: parseInt(form.courses[0]),
            initialPayment: parseFloat(form.initialPayment)
          });
        }
      }

      // ======================
      // TRAINER FLOW
      // ======================
      if (form.role === "TRAINER" && userId) {

        const trainerRes = await createTrainerProfile({
          user: { id: userId },
          phone: form.phone,
          specialization: form.specialization
        });

        const trainerProfileId = trainerRes?.data?.id;

        // assign courses + internships
        if (trainerProfileId) {
          await updateTrainerProfile(trainerProfileId, {
            courseIds: form.courses.map(c => parseInt(c)),
            internshipIds: form.internships.map(i => parseInt(i))
          });
        }

        // salary (optional)
        if (form.salary) {
          await recordTrainerPayment({
            trainerId: userId, // IMPORTANT FIX
            amount: parseFloat(form.salary),
            paymentMode: "CASH",
            paymentDate: new Date().toISOString().split("T")[0],
            remarks: "Initial salary"
          });
        }
      }

      toast.success("User created successfully");
      setOpen(false);
      fetchData();

      setForm({
        name: "", email: "", password: "", role: "STUDENT",
        phone: "", specialization: "",
        courses: [], internships: [],
        admissionDate: "", initialPayment: "", salary: ""
      });

    } catch (err: any) {
      const msg = err?.response?.data?.message || "Error creating user";
      toast.error(msg);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteUser(id);
    toast.success("Deleted");
    fetchData();
  };

  return (
    <div className="p-6 space-y-6">

      <div className="flex justify-between">
        <h1 className="text-xl font-bold">User Management</h1>
        <Button onClick={() => setOpen(true)}>Add User</Button>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.map(u => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(u.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </CardContent>
      </Card>

      {/* CREATE USER */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>

          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">

            <Input placeholder="Name"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />

            <Input placeholder="Email"
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />

            <Input type="password" placeholder="Password"
              value={form.password}
              onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} />

            <select
              value={form.role}
              onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full p-2 border rounded"
            >
              <option value="STUDENT">STUDENT</option>
              <option value="TRAINER">TRAINER</option>
              <option value="ADMIN">ADMIN</option>
            </select>

            {/* STUDENT */}
            {form.role === "STUDENT" && (
              <>
                <Input placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />

                <Input type="number" placeholder="Initial Payment"
                  value={form.initialPayment}
                  onChange={(e) => setForm(f => ({ ...f, initialPayment: e.target.value }))} />

                <p>Courses:</p>
                {courses.map(c => (
                  <div key={c.id}>
                    <Checkbox
                      checked={form.courses.includes(String(c.id))}
                      onCheckedChange={() =>
                        setForm(f => ({
                          ...f,
                          courses: toggle(f.courses, String(c.id))
                        }))
                      }
                    />
                    {c.name || c.title}
                  </div>
                ))}
              </>
            )}

            {/* TRAINER */}
            {form.role === "TRAINER" && (
              <>
                <Input placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />

                <Input placeholder="Specialization"
                  value={form.specialization}
                  onChange={(e) => setForm(f => ({ ...f, specialization: e.target.value }))} />

                <Input type="number" placeholder="Salary"
                  value={form.salary}
                  onChange={(e) => setForm(f => ({ ...f, salary: e.target.value }))} />

                <p>Courses:</p>
                {courses.map(c => (
                  <div key={c.id}>
                    <Checkbox
                      checked={form.courses.includes(String(c.id))}
                      onCheckedChange={() =>
                        setForm(f => ({
                          ...f,
                          courses: toggle(f.courses, String(c.id))
                        }))
                      }
                    />
                    {c.name || c.title}
                  </div>
                ))}
              </>
            )}

          </div>

          <DialogFooter>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>

    </div>
  );
}