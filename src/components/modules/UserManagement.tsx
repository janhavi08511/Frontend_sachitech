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
  getUsers, deleteUser, createFullUser
} from "../../api/userapi";

import { getCourses } from "../../api/courseApi";

export function UserManagement() {

  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
    phone: "",
    courses: [] as string[],
    admissionDate: "",
    initialPayment: ""
  });

  // ================= FETCH USERS =================
  const fetchUsers = async (pageNo = 0) => {
    setLoading(true);
    try {
      const res = await getUsers(pageNo, 10);

      const data = res.data;

      if (pageNo === 0) {
        setUsers(data.content);
      } else {
        setUsers(prev => [...prev, ...data.content]);
      }

      setHasMore(!data.last);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(0);
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const res = await getCourses();
    setCourses(res.data || []);
  };

  // ================= VALIDATION =================
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isFormValid =
    form.name &&
    isValidEmail(form.email) &&
    form.password.length >= 6;

  // ================= CREATE USER =================
  const handleCreate = async () => {
    if (!isFormValid) {
      toast.error("Fill all valid fields");
      return;
    }

    try {
      await createFullUser({
        ...form,
        courseIds: form.courses.map(Number),
        initialPayment: parseFloat(form.initialPayment || "0")
      });

      toast.success("User created");
      setOpen(false);
      fetchUsers(0);

      setForm({
        name: "",
        email: "",
        password: "",
        role: "STUDENT",
        phone: "",
        courses: [],
        admissionDate: "",
        initialPayment: ""
      });

    } catch {
      toast.error("Error creating user");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id: number) => {
    await deleteUser(id);
    toast.success("Deleted");
    fetchUsers(0);
  };

  // ================= FILTER =================
  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (list: string[], value: string) =>
    list.includes(value)
      ? list.filter(v => v !== value)
      : [...list, value];

  return (
    <div className="p-6 space-y-6 bg-[#fbfff1] min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#3c3744]">
          User Management
        </h1>
        <Button onClick={() => setOpen(true)}>
          + Add User
        </Button>
      </div>

      {/* SEARCH */}
      <Input
        placeholder="Search user..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {/* TABLE */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#b4c5e4]">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>

              {loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    Loading...
                  </TableCell>
                </TableRow>
              )}

              {!loading && filtered.map(u => (
                <TableRow key={u.id} className="hover:bg-gray-100 transition">
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>{u.phone || "N/A"}</TableCell>
                  <TableCell>{u.course || "N/A"}</TableCell>
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

      {/* LOAD MORE */}
      {hasMore && (
        <div className="text-center">
          <Button onClick={() => {
            const next = page + 1;
            setPage(next);
            fetchUsers(next);
          }}>
            Load More
          </Button>
        </div>
      )}

      {/* CREATE USER MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">

          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">

            <Input placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />

            <Input placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />

            <Input type="password" placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />

            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="border rounded p-2"
            >
              <option value="STUDENT">Student</option>
              <option value="TRAINER">Trainer</option>
              <option value="ADMIN">Admin</option>
            </select>

            {form.role === "STUDENT" && (
              <>
                <Input placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />

                <Input type="date"
                  value={form.admissionDate}
                  onChange={(e) => setForm({ ...form, admissionDate: e.target.value })} />

                <Input type="number" placeholder="Initial Payment (optional)"
                  value={form.initialPayment}
                  onChange={(e) => setForm({ ...form, initialPayment: e.target.value })} />

                <div className="col-span-2">
                  <p className="font-medium mb-1">Courses</p>
                  {courses.map(c => (
                    <div key={c.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={form.courses.includes(String(c.id))}
                        onCheckedChange={() =>
                          setForm({
                            ...form,
                            courses: toggle(form.courses, String(c.id))
                          })
                        }
                      />
                      {c.name}
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>

          <DialogFooter>
            <Button
              onClick={handleCreate}
              disabled={!isFormValid}
              className="w-full"
            >
              Create User
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>

    </div>
  );
}