import { useState, useEffect } from "react";
import { Header } from "../layout/Header";
import { Sidebar } from "../layout/Sidebar";
import { LMSModule } from "../modules/LMSModule";
import { AttendanceModule } from "../modules/AttendanceModule";
import { PerformanceModule } from "../modules/PerformanceModule";
import { StudentManagement } from "../modules/StudentManagement";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  Users, BookOpen, TrendingUp, Award,
  CheckCircle, XCircle, Clock, AlertCircle,
  FileText, Target, Activity, GraduationCap,
  Calendar, BarChart3, PieChart as PieChartIcon, RefreshCw
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell
} from "recharts";
import { User } from "../../types";
import API from "../../api/axios";

interface Props {
  user: User;
  onLogout: () => void;
}

export function TrainerDashboard({ user, onLogout }: Props) {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load real data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch students
      const studentsRes = await API.get("/api/trainer/students");
      const studentsData = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      setStudents(studentsData);

      // Fetch courses
      const coursesRes = await API.get("/api/admin/courses");
      const coursesData = Array.isArray(coursesRes.data) ? coursesRes.data : [];
      setCourses(coursesData);

      // Fetch assignments
      const assignmentsRes = await API.get("/api/admin/assignments");
      const assignmentsData = Array.isArray(assignmentsRes.data) ? assignmentsRes.data : [];
      setAssignments(assignmentsData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // Fallback to empty arrays - will show "no data" message
    } finally {
      setLoading(false);
    }
  };

  const totalStudents = students.length;
  const totalCourses = courses.length;
  
  // Calculate real metrics from data
  const avgAttendance = students.length > 0
    ? Math.round(students.reduce((sum: number, s: any) => sum + (s.attendance || 0), 0) / totalStudents)
    : 0;
  
  const avgScore = students.length > 0
    ? Math.round(students.reduce((sum: number, s: any) => sum + (s.avgScore || 0), 0) / totalStudents)
    : 0;
  
  const pendingEvaluations = assignments.filter((a: any) => a.evaluationStatus === "SUBMITTED" || a.evaluationStatus === "PENDING").length;
  const atRiskStudents = students.filter((s: any) => (s.attendance || 0) < 70).length;

  const pctColor = (p: number) => p >= 75 ? "text-emerald-600" : p >= 50 ? "text-amber-600" : "text-rose-600";
  const pctBg = (p: number) => p >= 75 ? "bg-emerald-500" : p >= 50 ? "bg-amber-500" : "bg-rose-500";

  // Generate mock charts if no real data
  const MOCK_ATTENDANCE_TREND = [
    { week: "Wk 1", java: 88, react: 85 },
    { week: "Wk 2", java: 82, react: 88 },
    { week: "Wk 3", java: 90, react: 82 },
    { week: "Wk 4", java: 85, react: 80 },
    { week: "Wk 5", java: 87, react: 86 },
    { week: "Wk 6", java: 85, react: 84 },
  ];

  const MOCK_SCORE_DISTRIBUTION = [
    { range: "90-100", count: 8 },
    { range: "80-89", count: 12 },
    { range: "70-79", count: 6 },
    { range: "60-69", count: 3 },
    { range: "<60", count: 1 },
  ];

  const MOCK_SUBMISSION_RATE = [
    { name: "Submitted", value: 32 },
    { name: "Pending", value: 8 },
    { name: "Graded", value: 27 },
  ];

  const PIE_COLORS = ["#3b82f6", "#f59e0b", "#10b981"];

  // ── DASHBOARD HOME ─────────────────────────────────────────────────────────
  const renderDashboard = () => (
    <div className="space-y-8">

      {/* Welcome */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">
            Welcome back, {user.name || "Trainer"} 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Your teaching dashboard — track student progress and performance.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-indigo-100 text-indigo-700 text-sm px-3 py-1">
            <GraduationCap className="w-4 h-4 mr-1 inline" /> Active Trainer
          </Badge>
          <button
            onClick={loadDashboardData}
            className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse bg-slate-200 h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          {/* KPI Cards - Real Data */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Students", value: totalStudents, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Courses Teaching", value: totalCourses, icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50" },
              { label: "Avg Attendance", value: `${avgAttendance}%`, icon: Calendar, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Avg Score", value: `${avgScore}%`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <Card key={label} className={`border-none shadow-sm ${bg}`}>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white shadow-sm">
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Alert Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-l-4 border-l-amber-500 shadow-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <AlertCircle className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold text-amber-600">{pendingEvaluations}</p>
                  <p className="text-sm text-slate-600">Assignments Pending Evaluation</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-rose-500 shadow-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <AlertCircle className="w-8 h-8 text-rose-600" />
                <div>
                  <p className="text-2xl font-bold text-rose-600">{atRiskStudents}</p>
                  <p className="text-sm text-slate-600">Students At Risk (Attendance &lt; 70%)</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Attendance Trend */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" /> Weekly Attendance Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={MOCK_ATTENDANCE_TREND} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                    <Tooltip formatter={(v: any) => [`${v}%`, ""]} />
                    <Line type="monotone" dataKey="java" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} name="Full Stack Java" />
                    <Line type="monotone" dataKey="react" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="React & Node" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Score Distribution */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-500" /> Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={MOCK_SCORE_DISTRIBUTION} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Assignment Submission Status */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-blue-500" /> Assignment Status
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <PieChart width={120} height={120}>
                <Pie data={MOCK_SUBMISSION_RATE} cx={55} cy={55} innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={3}>
                  {MOCK_SUBMISSION_RATE.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
              </PieChart>
              <div className="space-y-2 flex-1">
                {MOCK_SUBMISSION_RATE.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-slate-600">{d.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Student Performance Table - Real Data */}
          {students.length > 0 ? (
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" /> Student Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        {["Student Name", "Course", "Attendance", "Avg Score", "Status"].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.slice(0, 10).map((s, i) => (
                        <tr key={s.id} className={`border-b last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                          <td className="px-5 py-3 text-sm font-medium text-slate-800">{s.name || "Student"}</td>
                          <td className="px-5 py-3 text-sm text-slate-600">{s.course || "N/A"}</td>
                          <td className="px-5 py-3 text-sm">
                            <span className={`font-bold ${pctColor(s.attendance || 0)}`}>{s.attendance || 0}%</span>
                          </td>
                          <td className="px-5 py-3 text-sm">
                            <span className={`font-bold ${pctColor(s.avgScore || 0)}`}>{s.avgScore || 0}%</span>
                          </td>
                          <td className="px-5 py-3 text-sm">
                            <Badge className={(s.attendance || 0) >= 70 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}>
                              {(s.attendance || 0) >= 70 ? "Active" : "At Risk"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-none shadow-sm">
              <CardContent className="py-16 text-center text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No students assigned yet</p>
                <p className="text-xs mt-1">Assign students to see performance data here</p>
              </CardContent>
            </Card>
          )}

          {/* Pending Assignments - Real Data */}
          {assignments.length > 0 ? (
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" /> Assignments Pending Evaluation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        {["Assignment", "Course", "Student", "Status"].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.filter((a: any) => a.evaluationStatus !== "GRADED" && a.evaluationStatus !== "EVALUATED").slice(0, 10).map((a, i) => (
                        <tr key={a.id} className={`border-b last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                          <td className="px-5 py-3 text-sm font-medium text-slate-800">{a.title || "Untitled"}</td>
                          <td className="px-5 py-3 text-sm text-slate-600">{a.course?.name || "N/A"}</td>
                          <td className="px-5 py-3 text-sm text-slate-600">{a.student?.name || "N/A"}</td>
                          <td className="px-5 py-3 text-sm">
                            <Badge className={a.evaluationStatus === "SUBMITTED" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}>
                              {a.evaluationStatus || "PENDING"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-none shadow-sm">
              <CardContent className="py-16 text-center text-slate-400">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No assignments yet</p>
                <p className="text-xs mt-1">Create assignments to see them here</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );

  // ── MODULE ROUTER ──────────────────────────────────────────────────────────
  const renderModule = () => {
    switch (activeModule) {
      case "lms": return <LMSModule role={user.role} />;
      case "attendance": return <AttendanceModule role={user.role} />;
      case "students": return <StudentManagement role={user.role} />;
      case "performance": return <PerformanceModule role={user.role} />;
      default: return renderDashboard();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={user.role} activeModule={activeModule} onModuleChange={setActiveModule} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={onLogout} />
        <main className="flex-1 p-6 overflow-y-auto w-full max-w-7xl mx-auto">
          {renderModule()}
        </main>
      </div>
    </div>
  );
}
