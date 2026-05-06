import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { GraduationCap, TrendingUp, CheckCircle, AlertTriangle, BookOpen, Users } from "lucide-react";
import { getCourses, getLeaderboard, getAllCoursesPerformance, AllCoursePerformance } from "../../api/performanceApi";
import API from "../../api/axios";

interface Props {
  role?: string;
  studentProfileId?: number;
}

export function PerformanceModule({ role, studentProfileId }: Props) {
  const isStudent = role === "student" || role === "STUDENT";

  const [students, setStudents]           = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [coursePerf, setCoursePerf]       = useState<AllCoursePerformance[]>([]);
  const [leaderboard, setLeaderboard]     = useState<any[]>([]);
  const [selectedLeaderCourse, setSelectedLeaderCourse] = useState<number | null>(null);
  const [courses, setCourses]             = useState<any[]>([]);
  const [loading, setLoading]             = useState(false);
  const [activeCourseTab, setActiveCourseTab] = useState<number | null>(null);

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isStudent && studentProfileId) {
      setSelectedStudentId(studentProfileId);
    } else {
      // Trainers use their own scoped endpoint; admins use the full list
      const isTrainer = role === "trainer" || role === "TRAINER";
      const endpoint = isTrainer ? "/api/trainer/students" : "/api/admin/studentdata/all";
      API.get(endpoint)
        .then(r => {
          const s = Array.isArray(r.data) ? r.data : r.data?.data || [];
          setStudents(s);
          if (s.length > 0) setSelectedStudentId(s[0].id);
        })
        .catch(() => {});
    }
    getCourses().then(c => {
      setCourses(c);
      if (c.length > 0) setSelectedLeaderCourse(c[0].id);
    }).catch(() => {});
  }, [isStudent, studentProfileId, role]);

  // ── Load per-student all-courses performance ────────────────────────────────
  useEffect(() => {
    if (!selectedStudentId) return;
    setLoading(true);
    getAllCoursesPerformance(selectedStudentId)
      .then(data => {
        setCoursePerf(data);
        if (data.length > 0) setActiveCourseTab(data[0].courseId);
      })
      .catch(() => setCoursePerf([]))
      .finally(() => setLoading(false));
  }, [selectedStudentId]);

  // ── Leaderboard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedLeaderCourse) return;
    getLeaderboard(selectedLeaderCourse)
      .then(setLeaderboard)
      .catch(() => setLeaderboard([]));
  }, [selectedLeaderCourse]);

  const activeCourse = coursePerf.find(c => c.courseId === activeCourseTab);

  const pctColor = (pct: number) =>
    pct >= 75 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-rose-600";

  const statusBadge = (status: string) => {
    const s = status?.toUpperCase();
    if (s === "EVALUATED" || s === "GRADED")
      return <Badge className="bg-emerald-100 text-emerald-700 text-xs">✓ Graded</Badge>;
    if (s === "SUBMITTED")
      return <Badge className="bg-blue-100 text-blue-700 text-xs">Submitted</Badge>;
    return <Badge className="bg-slate-100 text-slate-500 text-xs">Pending</Badge>;
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" /> Performance Analytics
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Attendance, assignment grades and submissions — per enrolled course
          </p>
        </div>

        {/* Student selector (admin/trainer only) */}
        {!isStudent && students.length > 0 && (
          <Select
            value={selectedStudentId ? String(selectedStudentId) : ""}
            onValueChange={v => setSelectedStudentId(Number(v))}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              {students.map(s => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-slate-100 h-20 rounded-xl" />
          ))}
        </div>
      ) : coursePerf.length === 0 ? (
        <Card className="border-none shadow-sm">
          <CardContent className="py-16 text-center text-slate-400">
            <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No enrolled courses found.</p>
            <p className="text-xs mt-1">Enroll the student in a course to see performance data.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ── Course summary cards ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...coursePerf].reverse().map(cp => (
              <button
                key={cp.courseId}
                onClick={() => setActiveCourseTab(cp.courseId)}
                className={`text-left rounded-xl border p-4 transition-all shadow-sm ${
                  activeCourseTab === cp.courseId
                    ? "border-indigo-500 bg-indigo-50 shadow-indigo-100"
                    : "border-slate-200 bg-white hover:border-indigo-300"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-slate-800 text-sm leading-tight">{cp.courseName}</p>
                  {cp.attendancePercentage < 75 && (
                    <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 ml-1" />
                  )}
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Attendance</span>
                    <span className={`font-bold ${pctColor(cp.attendancePercentage)}`}>
                      {cp.attendancePercentage}%
                    </span>
                  </div>
                  <Progress value={cp.attendancePercentage} className="h-1.5" />
                  <div className="flex justify-between text-xs text-slate-500 pt-1">
                    <span>Avg Score</span>
                    <span className="font-bold text-indigo-600">{cp.averageScore}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{cp.totalAssignments} assignments</span>
                    <span>{cp.submitted} submitted</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* ── Active course detail ─────────────────────────────────────── */}
          {activeCourse && (
            <div className="space-y-5">

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "Attendance",
                    value: `${activeCourse.attendancePercentage}%`,
                    sub: `${activeCourse.classesAttended}/${activeCourse.totalClasses} classes`,
                    color: pctColor(activeCourse.attendancePercentage),
                    bg: activeCourse.attendancePercentage >= 75 ? "bg-emerald-50" : "bg-rose-50",
                  },
                  {
                    label: "Avg Score",
                    value: `${activeCourse.averageScore}%`,
                    sub: `${activeCourse.totalAssignments} assignments`,
                    color: "text-indigo-600",
                    bg: "bg-indigo-50",
                  },
                  {
                    label: "Submitted",
                    value: activeCourse.submitted,
                    sub: `of ${activeCourse.totalAssignments} total`,
                    color: "text-blue-600",
                    bg: "bg-blue-50",
                  },
                  {
                    label: "Graded",
                    value: activeCourse.assignments.filter(a => a.evaluationStatus?.toUpperCase() === "EVALUATED" || a.evaluationStatus?.toUpperCase() === "GRADED").length,
                    sub: "assignments evaluated",
                    color: "text-teal-600",
                    bg: "bg-teal-50",
                  },
                ].map((stat, i) => (
                  <Card key={i} className={`border-none ${stat.bg}`}>
                    <CardContent className="p-4 text-center">
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs font-medium text-slate-600 mt-0.5">{stat.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{stat.sub}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Insight */}
              <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${
                activeCourse.attendancePercentage < 75
                  ? "bg-rose-50 border-rose-200 text-rose-800"
                  : "bg-amber-50 border-amber-200 text-amber-800"
              }`}>
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>{activeCourse.insight}</p>
              </div>

              {/* Score chart */}
              {activeCourse.assignments.filter(a => a.score !== null).length > 0 && (
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-600">
                      Assignment Scores — {activeCourse.courseName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart
                        data={activeCourse.assignments
                          .filter(a => a.score !== null)
                          .map(a => ({
                            name: a.title.length > 14 ? a.title.slice(0, 14) + "…" : a.title,
                            score: a.percentage ?? 0,
                            max: 100,
                          }))}
                        margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                        <Tooltip formatter={(v: any) => [`${v}%`, "Score"]} />
                        <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} name="Score %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Assignment table */}
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50 py-3 px-5">
                  <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Assignments — {activeCourse.courseName}
                  </CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        {["Assignment", "Max Score", "Score", "Percentage", "Status", "Submission"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeCourse.assignments.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-slate-400">
                            No assignments for this course yet.
                          </td>
                        </tr>
                      ) : [...activeCourse.assignments].reverse().map((a, i) => (
                        <tr key={a.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                          <td className="px-4 py-3 font-medium text-slate-800">{a.title}</td>
                          <td className="px-4 py-3 text-center text-slate-600">{a.maxScore}</td>
                          <td className="px-4 py-3 text-center">
                            {a.score !== null ? (
                              <span className="font-semibold text-indigo-600">{a.score}</span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {a.percentage !== null ? (
                              <span className={`font-bold ${pctColor(a.percentage)}`}>
                                {a.percentage}%
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">{statusBadge(a.evaluationStatus)}</td>
                          <td className="px-4 py-3">
                            {a.submissionLink ? (
                              <a
                                href={a.submissionLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:underline text-xs flex items-center gap-1"
                              >
                                <CheckCircle className="w-3 h-3" /> View
                              </a>
                            ) : (
                              <span className="text-slate-400 text-xs">Not submitted</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </>
      )}

      {/* ── Leaderboard ──────────────────────────────────────────────────────── */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
              <Users className="w-4 h-4" /> Course Leaderboard
            </CardTitle>
            {courses.length > 0 && (
              <Select
                value={selectedLeaderCourse ? String(selectedLeaderCourse) : ""}
                onValueChange={v => setSelectedLeaderCourse(Number(v))}
              >
                <SelectTrigger className="w-48 h-8 text-xs">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {leaderboard.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              No graded assignments yet for this course.
            </div>
          ) : (
            leaderboard.slice(0, 10).map((l: any, i: number) => (
              <div
                key={l.studentId}
                className={`flex items-center justify-between px-5 py-3 border-b last:border-0 ${
                  i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? "bg-yellow-100 text-yellow-700" :
                    i === 1 ? "bg-slate-100 text-slate-600" :
                    i === 2 ? "bg-orange-100 text-orange-600" :
                    "bg-slate-50 text-slate-500"
                  }`}>
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-800">{l.studentName}</span>
                </div>
                <span className="text-sm font-bold text-indigo-600">{l.averageScore}%</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
