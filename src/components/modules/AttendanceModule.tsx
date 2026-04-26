import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";
import {
  Users, Calendar, CheckCircle, XCircle, Clock, BarChart2,
  Search, AlertTriangle, Lock, Unlock
} from "lucide-react";
import {
  getAllCourses,
  getCourseStudents,
  markBulkAttendance,
  lockCourse,
  unlockCourse,
  getCourseSummaryReport,
  getStudentReport,
} from "../../api/attendanceApi";

interface Props {
  role: string;
  userId?: number;
  studentProfileId?: number;
}

type Tab = "mark" | "report" | "my-attendance";

export function AttendanceModule({ role, userId, studentProfileId }: Props) {
  const isStudent = role === "student";
  const [activeTab, setActiveTab] = useState<Tab>(isStudent ? "my-attendance" : "mark");

  // ── Shared state ────────────────────────────────────────────────────────────
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // ── Marking state ───────────────────────────────────────────────────────────
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [locked, setLocked] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // ── Report state ────────────────────────────────────────────────────────────
  const [summaryReport, setSummaryReport] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Student view state ──────────────────────────────────────────────────────
  const [myReport, setMyReport] = useState<any>(null);
  const [myReportLoading, setMyReportLoading] = useState(false);

  // ── Load courses on mount ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isStudent) {
      getAllCourses(role)
        .then(data => {
          setCourses(data);
          if (data.length > 0) setSelectedCourse(String(data[0].id));
        })
        .catch(() => toast.error("Failed to load courses"));
    }
  }, [role, isStudent]);

  // ── Load students when course changes ─────────────────────────────────────
  useEffect(() => {
    if (selectedCourse && activeTab === "mark") {
      loadStudents();
    }
  }, [selectedCourse, activeTab]);

  // ── Load report when course changes ───────────────────────────────────────
  useEffect(() => {
    if (selectedCourse && activeTab === "report") {
      loadSummaryReport();
    }
  }, [selectedCourse, activeTab]);

  // ── Load student's own report ───────────────────────────────────────────────
  useEffect(() => {
    if (isStudent && activeTab === "my-attendance" && studentProfileId) {
      loadMyReport();
    }
  }, [isStudent, activeTab, studentProfileId]);

  const loadStudents = async () => {
    if (!selectedCourse) return;
    setLoadingStudents(true);
    try {
      const data = await getCourseStudents(Number(selectedCourse));
      setStudents(Array.isArray(data) ? data : []);
      // Default all to PRESENT
      const defaults: Record<number, string> = {};
      (Array.isArray(data) ? data : []).forEach((s: any) => { defaults[s.id] = "PRESENT"; });
      setAttendance(defaults);
    } catch {
      toast.error("Failed to load students");
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const loadSummaryReport = async () => {
    if (!selectedCourse) return;
    setReportLoading(true);
    try {
      const data = await getCourseSummaryReport(Number(selectedCourse));
      setSummaryReport(data);
    } catch {
      toast.error("Failed to load report");
    } finally {
      setReportLoading(false);
    }
  };

  const loadMyReport = async () => {
    if (!studentProfileId) return;
    setMyReportLoading(true);
    try {
      const data = await getStudentReport(studentProfileId);
      setMyReport(data);
    } catch {
      toast.error("Failed to load your attendance");
    } finally {
      setMyReportLoading(false);
    }
  };

  const handleLock = async () => {
    if (!selectedCourse) return;
    try {
      await lockCourse(Number(selectedCourse));
      setLocked(true);
      toast.success("Session locked. You can now mark attendance.");
    } catch (e: any) {
      if (e.response?.status === 409) {
        toast.error("Another user is already marking attendance for this course!");
      } else {
        toast.error("Failed to lock session");
      }
    }
  };

  const handleSave = async () => {
    if (!selectedCourse || students.length === 0) return;
    setSaving(true);
    try {
      const records = students.map(s => ({
        studentId: s.id,
        status: attendance[s.id] || "ABSENT"
      }));
      await markBulkAttendance(Number(selectedCourse), selectedDate, records);
      setLocked(false);
      toast.success(`Attendance saved for ${records.length} students!`);
      // Reload report if on report tab
      if (activeTab === "report") loadSummaryReport();
    } catch {
      toast.error("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (locked && selectedCourse) {
      await unlockCourse(Number(selectedCourse)).catch(() => {});
    }
    setLocked(false);
    setAttendance({});
  };

  const setAll = (status: string) => {
    const updated: Record<number, string> = {};
    students.forEach(s => { updated[s.id] = status; });
    setAttendance(updated);
  };

  const statusColor = (s: string) => {
    if (s === "PRESENT") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (s === "ABSENT") return "bg-rose-100 text-rose-700 border-rose-200";
    if (s === "LATE") return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-slate-100 text-slate-600";
  };

  const pctColor = (pct: number) => {
    if (pct >= 75) return "text-emerald-600";
    if (pct >= 50) return "text-amber-600";
    return "text-rose-600";
  };

  const filteredStudents = summaryReport?.students?.filter((s: any) =>
    s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // ── TABS ────────────────────────────────────────────────────────────────────
  const tabs = isStudent
    ? [{ id: "my-attendance", label: "My Attendance", icon: Calendar }]
    : [
        { id: "mark", label: "Mark Attendance", icon: CheckCircle },
        { id: "report", label: "Reports", icon: BarChart2 },
      ];

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-indigo-600" /> Attendance Management
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {isStudent ? "View your attendance history" : "Mark and track student attendance"}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as Tab)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === id
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* ── MARK ATTENDANCE TAB ─────────────────────────────────────────────── */}
      {activeTab === "mark" && (
        <div className="space-y-5">
          {/* Course + Date selectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedCourse} onValueChange={v => { setSelectedCourse(v); setLocked(false); }}>
              <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
              <SelectContent>
                {courses.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name || "Unnamed Course"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            {!locked ? (
              <Button onClick={handleLock} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                <Lock className="w-4 h-4" /> Start Marking Session
              </Button>
            ) : (
              <Button variant="outline" onClick={handleCancel} className="gap-2 text-slate-600">
                <Unlock className="w-4 h-4" /> Cancel Session
              </Button>
            )}
          </div>

          {/* Lock notice */}
          {!locked && (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              Click "Start Marking Session" to lock this course and begin marking. This prevents conflicts with other users.
            </div>
          )}

          {/* Bulk actions */}
          {locked && students.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-slate-500 font-medium">Mark all as:</span>
              <Button size="sm" onClick={() => setAll("PRESENT")} className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-xs">✓ Present</Button>
              <Button size="sm" onClick={() => setAll("ABSENT")} className="bg-rose-600 hover:bg-rose-700 text-white h-7 text-xs">✗ Absent</Button>
              <Button size="sm" onClick={() => setAll("LATE")} className="bg-amber-500 hover:bg-amber-600 text-white h-7 text-xs">⏱ Late</Button>
            </div>
          )}

          {/* Student list */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-0">
              {loadingStudents ? (
                <div className="space-y-2 p-4">
                  {[1,2,3,4].map(i => <div key={i} className="animate-pulse bg-slate-100 h-14 rounded-lg" />)}
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No students found for this course.</p>
                  <p className="text-xs mt-1">Make sure students are enrolled in this course.</p>
                </div>
              ) : (
                students.map((s, idx) => {
                  const status = attendance[s.id] || "ABSENT";
                  return (
                    <div
                      key={s.id}
                      className={`flex items-center justify-between px-5 py-3.5 border-b last:border-0 transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                          {s.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{s.name}</p>
                          <p className="text-xs text-slate-400">{s.email}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {["PRESENT", "ABSENT", "LATE"].map(st => (
                          <button
                            key={st}
                            disabled={!locked}
                            onClick={() => setAttendance(prev => ({ ...prev, [s.id]: st }))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                              status === st
                                ? statusColor(st) + " shadow-sm scale-105"
                                : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                            } ${!locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            {st === "PRESENT" ? "P" : st === "ABSENT" ? "A" : "L"}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Summary + Submit */}
          {locked && students.length > 0 && (
            <div className="flex items-center justify-between bg-white border rounded-xl p-4 shadow-sm">
              <div className="flex gap-6 text-sm">
                <span className="text-emerald-600 font-semibold">
                  ✓ Present: {Object.values(attendance).filter(v => v === "PRESENT").length}
                </span>
                <span className="text-rose-600 font-semibold">
                  ✗ Absent: {Object.values(attendance).filter(v => v === "ABSENT").length}
                </span>
                <span className="text-amber-600 font-semibold">
                  ⏱ Late: {Object.values(attendance).filter(v => v === "LATE").length}
                </span>
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6"
              >
                {saving ? "Saving…" : "Submit Attendance"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── REPORT TAB ──────────────────────────────────────────────────────── */}
      {activeTab === "report" && (
        <div className="space-y-5">
          {/* Course selector */}
          <div className="flex gap-3 items-center flex-wrap">
            <Select value={selectedCourse} onValueChange={v => setSelectedCourse(v)}>
              <SelectTrigger className="w-64"><SelectValue placeholder="Select Course" /></SelectTrigger>
              <SelectContent>
                {courses.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name || "Unnamed Course"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={loadSummaryReport}>Refresh</Button>
          </div>

          {reportLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="animate-pulse bg-slate-100 h-16 rounded-xl" />)}
            </div>
          ) : summaryReport ? (
            <>
              {/* Stats cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Students", value: summaryReport.totalStudents, color: "text-indigo-600", bg: "bg-indigo-50" },
                  { label: "Avg Attendance", value: `${summaryReport.averagePercentage}%`, color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "Low Attendance", value: summaryReport.lowAttendanceCount, color: "text-rose-600", bg: "bg-rose-50" },
                  { label: "Sessions Held", value: summaryReport.dates?.length || 0, color: "text-blue-600", bg: "bg-blue-50" },
                ].map((stat, i) => (
                  <Card key={i} className={`border-none ${stat.bg}`}>
                    <CardContent className="p-4 text-center">
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by student name or email…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Student table */}
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50 py-3 px-5">
                  <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Student Attendance Report — {summaryReport.courseName}
                  </CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        {["Student", "Email", "Total Days", "Present", "Attendance %", "Status"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-10 text-slate-400">No students found</td></tr>
                      ) : filteredStudents.map((s: any, i: number) => (
                        <tr key={s.studentId} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                          <td className="px-4 py-3 font-medium text-slate-800">{s.studentName}</td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{s.email}</td>
                          <td className="px-4 py-3 text-center">{s.totalDays}</td>
                          <td className="px-4 py-3 text-center">{s.presentDays}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-bold ${pctColor(s.percentage)}`}>{s.percentage}%</span>
                          </td>
                          <td className="px-4 py-3">
                            {s.lowAttendance ? (
                              <Badge className="bg-rose-100 text-rose-700 text-xs">⚠ Low</Badge>
                            ) : (
                              <Badge className="bg-emerald-100 text-emerald-700 text-xs">✓ Good</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <BarChart2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Select a course to view the attendance report.</p>
            </div>
          )}
        </div>
      )}

      {/* ── STUDENT VIEW ────────────────────────────────────────────────────── */}
      {activeTab === "my-attendance" && (
        <div className="space-y-5">
          {myReportLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="animate-pulse bg-slate-100 h-16 rounded-xl" />)}
            </div>
          ) : myReport ? (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Attendance %", value: `${myReport.percentage}%`, color: pctColor(myReport.percentage), bg: "bg-white" },
                  { label: "Present Days", value: myReport.presentDays, color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "Absent Days", value: myReport.absentDays, color: "text-rose-600", bg: "bg-rose-50" },
                  { label: "Late Days", value: myReport.lateDays, color: "text-amber-600", bg: "bg-amber-50" },
                ].map((stat, i) => (
                  <Card key={i} className={`border-none shadow-sm ${stat.bg}`}>
                    <CardContent className="p-5 text-center">
                      <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Attendance % bar */}
              <Card className="border-none shadow-sm">
                <CardContent className="p-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Overall Attendance</span>
                    <span className={`text-sm font-bold ${pctColor(myReport.percentage)}`}>{myReport.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        myReport.percentage >= 75 ? "bg-emerald-500" :
                        myReport.percentage >= 50 ? "bg-amber-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${Math.min(myReport.percentage, 100)}%` }}
                    />
                  </div>
                  {myReport.percentage < 75 && (
                    <p className="text-xs text-rose-600 mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Your attendance is below 75%. Please attend more classes.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Daily log */}
              <Card className="border-none shadow-sm">
                <CardHeader className="py-3 px-5 bg-slate-50">
                  <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Attendance History ({myReport.logs?.length || 0} records)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {myReport.logs?.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">No attendance records yet.</div>
                  ) : (
                    myReport.logs.map((log: any, i: number) => (
                      <div
                        key={log.id}
                        className={`flex items-center justify-between px-5 py-3 border-b last:border-0 ${
                          i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {log.status === "PRESENT" && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                          {log.status === "ABSENT" && <XCircle className="w-4 h-4 text-rose-500" />}
                          {log.status === "LATE" && <Clock className="w-4 h-4 text-amber-500" />}
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {new Date(log.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                            </p>
                            <p className="text-xs text-slate-400">{log.courseName}</p>
                          </div>
                        </div>
                        <Badge className={statusColor(log.status) + " text-xs font-semibold"}>
                          {log.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No attendance data found.</p>
              <p className="text-xs mt-1">Your attendance will appear here once it's been marked.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
