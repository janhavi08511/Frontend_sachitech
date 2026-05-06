import { useEffect, useMemo, useState } from "react";

import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";

import { toast, Toaster } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../ui/table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "../ui/dialog";

import {
  getUsers,
  deleteUser,
  createFullUser
} from "../../api/userapi";

import { getCourses } from "../../api/courseApi";

export function UserManagement() {

  // ================= STATES =================

  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 20;

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

  const fetchUsers = async (p = page) => {

    setLoading(true);

    try {

      const data = await getUsers(p, PAGE_SIZE);

      console.log("USERS API:", data);

      if (data?.content && Array.isArray(data.content)) {

        setUsers(data.content);
        setTotalPages(data.totalPages ?? 0);
        setTotalElements(data.totalElements ?? 0);
        setPage(p);

      } else {

        console.error("Invalid users response:", data);

        setUsers([]);

        toast.error("Invalid users response");
      }

    } catch (error) {

      console.error("Users fetch error:", error);

      toast.error("Failed to load users");

      setUsers([]);

    } finally {

      setLoading(false);
    }
  };

  // ================= LOAD COURSES =================

  const loadCourses = async () => {

    try {

      const data = await getCourses();

      console.log("COURSES API:", data);

      if (Array.isArray(data)) {

        setCourses(data);

      } else {

        console.error("Invalid courses response:", data);

        setCourses([]);
      }

    } catch (error) {

      console.error("Courses load error:", error);

      toast.error("Failed to load courses");

      setCourses([]);
    }
  };

  // ================= INITIAL LOAD =================

  useEffect(() => {

    fetchUsers();
    loadCourses();

  }, []);

  // ================= VALIDATION =================

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isFormValid = useMemo(() => {

    return (
      form.name.trim().length >= 3 &&
      isValidEmail(form.email) &&
      form.password.length >= 6
    );

  }, [form]);

  // ================= CREATE USER =================

  const handleCreate = async () => {

    if (!isFormValid) {

      toast.error("Please enter valid details");

      return;
    }

    try {

      await createFullUser({
        ...form,
        courseIds: form.courses.map(Number),
        initialPayment: parseFloat(form.initialPayment || "0")
      });

      toast.success("User created successfully");

      setOpen(false);

      await fetchUsers();

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

    } catch (error) {

      console.error(error);

      toast.error("Failed to create user");
    }
  };

  // ================= DELETE USER =================

  const handleDelete = async (id: number) => {

    try {

      await deleteUser(id);

      toast.success("User deleted successfully");

      await fetchUsers();

    } catch (error: any) {

      console.error(error);

      const msg = error?.response?.data?.error || "Delete failed";

      toast.error(msg);
    }
  };

  // ================= FILTER =================

  const filteredUsers = useMemo(() => {

    return users.filter((u) =>
      u.name?.toLowerCase()
        .includes(search.toLowerCase())
    );

  }, [users, search]);

  // ================= TOGGLE COURSES =================

  const toggleCourse = (value: string) => {

    setForm((prev) => ({

      ...prev,

      courses: prev.courses.includes(value)
        ? prev.courses.filter((v) => v !== value)
        : [...prev.courses, value]

    }));
  };

  // ================= UI =================

  return (
    <div className="min-h-screen bg-[#fbfff1] p-6 space-y-6">

      <Toaster richColors position="top-right" />

      {/* HEADER */}

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-3xl font-bold text-[#3c3744]">
            User Management
          </h1>

          <p className="text-gray-500">
            Manage students, trainers and admins
          </p>

        </div>

        <Button
          onClick={() => setOpen(true)}
          className="bg-[#090c9b] hover:bg-[#3066be]"
        >
          + Add User
        </Button>

      </div>

      {/* SEARCH */}

      <Card className="rounded-2xl border-0 shadow-sm">

        <CardContent className="p-4">

          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />

        </CardContent>

      </Card>

      {/* USERS TABLE */}

      <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">

        <CardContent className="p-0">

          <Table>

            <TableHeader>

              <TableRow className="bg-[#b4c5e4]">

                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Actions</TableHead>

              </TableRow>

            </TableHeader>

            <TableBody>

              {loading && (

                <TableRow>

                  <TableCell
                    colSpan={6}
                    className="text-center py-10"
                  >
                    Loading users...
                  </TableCell>

                </TableRow>
              )}

              {!loading && filteredUsers.length === 0 && (

                <TableRow>

                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-gray-500"
                  >
                    No users found
                  </TableCell>

                </TableRow>
              )}

              {!loading && filteredUsers.map((u) => (

                <TableRow
                  key={u.id}
                  className="hover:bg-gray-50 transition"
                >

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

      {/* PAGINATION */}

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">

          <p className="text-sm text-gray-500">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalElements)} of {totalElements} users
          </p>

          <div className="flex gap-2">

            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => fetchUsers(page - 1)}
            >
              Previous
            </Button>

            <span className="flex items-center px-3 text-sm">
              Page {page + 1} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => fetchUsers(page + 1)}
            >
              Next
            </Button>

          </div>

        </div>
      )}

      {/* CREATE USER MODAL */}

      <Dialog open={open} onOpenChange={setOpen}>

        <DialogContent className="max-w-2xl rounded-2xl">

          <DialogHeader>

            <DialogTitle>
              Create User
            </DialogTitle>

          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">

            <Input
              placeholder="Name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value
                })
              }
            />

            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value
                })
              }
            />

            <Input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value
                })
              }
            />

            <select
              value={form.role}
              onChange={(e) =>
                setForm({
                  ...form,
                  role: e.target.value
                })
              }
              className="border rounded-lg px-3"
            >
              <option value="STUDENT">Student</option>
              <option value="TRAINER">Trainer</option>
              <option value="ADMIN">Admin</option>
            </select>

            {form.role === "STUDENT" && (
              <>
                <Input
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value
                    })
                  }
                />

                <Input
                  type="date"
                  value={form.admissionDate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      admissionDate: e.target.value
                    })
                  }
                />

                <Input
                  type="number"
                  placeholder="Initial Payment"
                  value={form.initialPayment}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      initialPayment: e.target.value
                    })
                  }
                />

                {/* COURSES */}

                <div className="col-span-2">

                  <p className="font-medium mb-3">
                    Assign Courses
                  </p>

                  {courses.length === 0 ? (

                    <div className="text-sm text-gray-500">
                      No courses available
                    </div>

                  ) : (

                    <div className="grid grid-cols-2 gap-3">

                      {courses.map((c) => (

                        <label
                          key={c.id}
                          className="flex items-center gap-2 border rounded-lg p-3"
                        >

                          <Checkbox
                            checked={form.courses.includes(String(c.id))}
                            onCheckedChange={() =>
                              toggleCourse(String(c.id))
                            }
                          />

                          <span>{c.name}</span>

                        </label>

                      ))}

                    </div>

                  )}

                </div>
              </>
            )}

          </div>

          <DialogFooter>

            <Button
              onClick={handleCreate}
              disabled={!isFormValid}
              className="w-full bg-[#090c9b]"
            >
              Create User
            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

    </div>
  );
}