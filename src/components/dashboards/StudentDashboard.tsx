import { useState } from "react";
import { Header } from "../layout/Header";
import { Sidebar } from "../layout/Sidebar";
import { LMSModule } from "../modules/LMSModule";
import { AttendanceModule } from "../modules/AttendanceModule";
import { FeePaymentManagement } from "../modules/FeePaymentManagement";
import { PerformanceModule } from "../modules/PerformanceModule";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  BookOpen, Calendar, TrendingUp, DollarSign,
  CheckCircle, XCircle, Clock, AlertTriangle,
  Award, Target, Activity, GraduationCap
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell
} from "recharts";
import { User } from "../../types";

// ── Mock data ──────────────────────────────────────────────────────────────────

const MOCK_ATTENDANCE = {
  percentage: 82,
  presentDays: 41,
  absentDays: 7,
  lateDays: 2,
  totalDays: 50,
  logs: [
    { id: 1, date: "2025-04-17", status: "PRESENT", courseName: "Full Stack Java" },
    { id: 2, date: "2025-04-16", status: "PRESENT", courseName: "Full Stack Java" },
    { id: 3, date: "2025-04-15", status: "ABSENT",  courseName: "Full Stack Java" },
    { id: 4, date: "2025-04-14", status: "LATE",    courseName: "React & Node" },
    { id: 5, date: "2025-04-11", status: "PRESENT", courseName: "React & Node" },
    { id: 6, date: "2025-04-10", status: "PRESENT", courseName: "Full Stack Java" },
    { id: 7, date: "2025-04-09", status: "ABSENT",  courseName: "React & Node" },
    { id: 8, date: "2025-04-08", status: "PRESENT", courseName: "Full Stack Java" },
    { id: 9, date: "2025-04-07", status: "PRESENT", courseName: "React & Node" },
    { id: 10, date: "2025-04-04", status: "PRESENT", courseName: "Full Stack Java" },
  ],
};

const MOCK_PERFORMANCE_COURSES = [
  {
    courseId: 1, courseName: "Full Stack Java",
    attendancePercentage: 85, averageScore: 82,
    totalClasses: 30, classesAttended: 26,
    totalAssignments: 6, submitted: 5,
    insight: "Good performance. Keep up the consistency in assignments.",
    assignments: [
      { id: 1, title: "JDBC Basics",      maxScore: 100, score: 88, percentage: 88, evaluationStatus: "EVALUATED", submissionLink: "#" },
      { id: 2, title: "Spring Boot REST", maxScore: 100, score: 75, percentage: 75, evaluationStatus: "EVALUATED", submissionLink: "#" },
      { id: 3, title: "Hibernate ORM",    maxScore: 100, score: 90, percentage: 90, evaluationStatus: "EVALUATED", submissionLink: "#" },
      { id: 4, title: "JWT Auth",         maxScore: 100, score: 72, percentage: 72, evaluationStatus: "EVALUATED", submissionLink: "#" },
      { id: 5, title: "Docker Deploy",    maxScore: 100, score: null, percentage: null, evaluationStatus: "SUBMITTED", submissionLink: "#" },
      { id: 6, title: "Final Project",    maxScore: 100, score: null, percentage: null, evaluationStatus: "PENDING",   submissionLink: null },
    ],
  },
  {
    courseId: 2, courseName: "React & Node",
    attendancePercentage: 78, averageScore: 74,
    totalClasses: 20, classesAttended: 16,
    totalAssignments: 4, submitted: 4,
    insight: "Attendance slightly below target. Aim for 80%+ next month.",
    assignments: [
      { id: 7, title: "React Hooks",      maxScore: 100, score: 80, percentage: 80, evaluationStatus: "EVALUATED", submissionLink: "#" },
      { id: 8, title: "Redux Toolkit",    maxScore: 100, score: 65, percentage: 65, evaluationStatus: "EVALUATED", submissionLink: "#" },
      { id: 9, title: "Node REST API",    maxScore: 100, score: 78, percentage: 78, evaluationStatus: "EVALUATED", submissionLink: "#" },
      { id: 10, title: "Full App Deploy", maxScore: 100, score: 72, percentage: 72, evaluationStatus: "EVALUATED", submissionLink: "#" },
    ],
  },
];

const MOCK_FEES = {
  totalFee: 45000,
  paid: 30000,
  pending: 15000,
  nextDue: "2025-05-01",
  transactions: [
    { id: 1, date: "2025-03-01", amount: 15000, type: "ONLINE", receipt: "RCP-001" },
    { id: 2, date: "2025-02-01", amount: 10000, type: "CASH",   receipt: "RCP-002" },
    { id: 3, date: "2025-01-05", amount: 5000,  type: "ONLINE", receipt: "RCP-003" },
  ],
};

const MOCK_WEEKLY = [
  { week: "Wk 1", present: 5, absent: 0 },
  { week: "Wk 2", present: 4, absent: 1 },
  { week: "Wk 3", present: 5, absent: 0 },
  { week: "Wk 4", present: 3, absent: 2 },
  { week: "Wk 5", present: 4, absent: 1 },
  { week: "Wk 6", present: 5, absent: 0 },
];

const MOCK_SCORE_TREND = [
  { name: "JDBC",      score: 88 },
  { name: "Spring",    score: 75 },
  { name: "Hibernate", score: 90 },
  { name: "JWT",       score: 72 },
  { name: "React",     score: 80 },
  { name: "Redux",     score: 65 },
  { name: "Node",      score: 78 },
  { name: "Deploy",    score: 72 },
];

const PIE_COLORS = ["#10b981", "#f43f5e", "#f59e0b"];

interface Props {
  user: User;
  onLogout: () => void;
}
export function StudentDashboard({ user, onLogout }: Props) {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [activePerfCourse, setActivePerfCourse] = useState(MOCK_PERFORMANCE_COURSES[0].courseId);
  const [activeAttTab, setActiveAttTab] = useState<"overview"|"history">("overview");

  const pctColor = (p: number) => p >= 75 ? "text-emerald-600" : p >= 50 ? "text-amber-600" : "text-rose-600";
  const pctBg    = (p: number) => p >= 75 ? "bg-emerald-500" : p >= 50 ? "bg-amber-500" : "bg-rose-500";

  const activeCourse = MOCK_PERFORMANCE_COURSES.find(c => c.courseId === activePerfCourse)!;
  const feeProgress  = Math.round((MOCK_FEES.paid / MOCK_FEES.totalFee) * 100);
  const pieData = [
    { name: "Present", value: MOCK_ATTENDANCE.presentDays },
    { name: "Absent",  value: MOCK_ATTENDANCE.absentDays  },
    { name: "Late",    value: MOCK_ATTENDANCE.lateDays     },
  ];

  // -- DASHBOARD HOME ---------------------------------------------------------
  const renderDashboard = () => (
    <div className="space-y-8">

      {/* Welcome */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">
            Welcome back, {user.name || "Student"} ??
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Here is your learning snapshot for April 2025.
          </p>
        </div>
        <Badge className="bg-indigo-100 text-indigo-700 text-sm px-3 py-1">
          <GraduationCap className="w-4 h-4 mr-1 inline" /> Active Student
        </Badge>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Attendance",    value: `${MOCK_ATTENDANCE.percentage}%`,       icon: Calendar,   color: "text-indigo-600",  bg: "bg-indigo-50"  },
          { label: "Avg Score",     value: "78%",                                   icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Courses",       value: MOCK_PERFORMANCE_COURSES.length,         icon: BookOpen,   color: "text-blue-600",    bg: "bg-blue-50"    },
          { label: "Fee Paid",      value: `${MOCK_FEES.paid.toLocaleString()}`,   icon: DollarSign, color: "text-purple-600",  bg: "bg-purple-50"  },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className={`border-none shadow-sm ${bg}`}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-white shadow-sm`}>
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

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Weekly attendance bar */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" /> Weekly Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={MOCK_WEEKLY} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="present" fill="#6366f1" radius={[4,4,0,0]} name="Present" />
                <Bar dataKey="absent"  fill="#f43f5e" radius={[4,4,0,0]} name="Absent"  />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Score trend line */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Assignment Score Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={MOCK_SCORE_TREND} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(v: any) => [`${v}%`, "Score"]} />
                <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: "#10b981" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Attendance + Fee row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Attendance pie */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" /> Attendance Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <PieChart width={120} height={120}>
              <Pie data={pieData} cx={55} cy={55} innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={3}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
            </PieChart>
            <div className="space-y-2 flex-1">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i] }} />
                    <span className="text-slate-600">{d.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">{d.value} days</span>
                </div>
              ))}
              <div className="pt-2 border-t">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Overall</span>
                  <span className={`font-bold ${pctColor(MOCK_ATTENDANCE.percentage)}`}>
                    {MOCK_ATTENDANCE.percentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
                  <div className={`h-2 rounded-full ${pctBg(MOCK_ATTENDANCE.percentage)}`}
                    style={{ width: `${MOCK_ATTENDANCE.percentage}%` }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fee status */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-purple-500" /> Fee Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Fee</span>
              <span className="font-bold text-slate-800">{MOCK_FEES.totalFee.toLocaleString()}</span>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Paid: {MOCK_FEES.paid.toLocaleString()}</span>
                <span className="font-bold text-emerald-600">{feeProgress}%</span>
              </div>
              <Progress value={feeProgress} className="h-3" />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Pending</span>
              <span className="font-bold text-rose-600">{MOCK_FEES.pending.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Next Due</span>
              <span className="font-semibold text-amber-600">{MOCK_FEES.nextDue}</span>
            </div>
            <div className="space-y-1 pt-2 border-t">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Recent Payments</p>
              {MOCK_FEES.transactions.slice(0, 2).map(t => (
                <div key={t.id} className="flex justify-between text-xs text-slate-600">
                  <span>{t.date}</span>
                  <span className="font-semibold text-emerald-600">+{t.amount.toLocaleString()}</span>
                  <Badge className="bg-slate-100 text-slate-500 text-xs">{t.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course progress */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-500" /> Enrolled Courses
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {MOCK_PERFORMANCE_COURSES.map(c => (
            <div key={c.courseId} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-slate-800">{c.courseName}</p>
                <Badge className={c.attendancePercentage >= 75 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                  {c.attendancePercentage >= 75 ? "On Track" : "Needs Attention"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-500">
                <div>
                  <p className="font-medium text-slate-700">Attendance</p>
                  <p className={`text-lg font-bold ${pctColor(c.attendancePercentage)}`}>{c.attendancePercentage}%</p>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Avg Score</p>
                  <p className="text-lg font-bold text-indigo-600">{c.averageScore}%</p>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Assignments</p>
                  <p className="text-lg font-bold text-blue-600">{c.submitted}/{c.totalAssignments}</p>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Classes</p>
                  <p className="text-lg font-bold text-slate-700">{c.classesAttended}/{c.totalClasses}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent attendance log */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" /> Recent Attendance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {MOCK_ATTENDANCE.logs.slice(0, 5).map((log, i) => (
            <div key={log.id} className={`flex items-center justify-between px-5 py-3 border-b last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
              <div className="flex items-center gap-3">
                {log.status === "PRESENT" && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                {log.status === "ABSENT"  && <XCircle    className="w-4 h-4 text-rose-500"    />}
                {log.status === "LATE"    && <Clock      className="w-4 h-4 text-amber-500"   />}
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {new Date(log.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                  </p>
                  <p className="text-xs text-slate-400">{log.courseName}</p>
                </div>
              </div>
              <Badge className={
                log.status === "PRESENT" ? "bg-emerald-100 text-emerald-700" :
                log.status === "ABSENT"  ? "bg-rose-100 text-rose-700" :
                "bg-amber-100 text-amber-700"
              }>{log.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  // -- ATTENDANCE REPORT ------------------------------------------------------
  const renderAttendance = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-indigo-600" /> My Attendance Report
        </h1>
        <p className="text-slate-500 text-sm mt-1">Full attendance history across all enrolled courses</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {(["overview", "history"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveAttTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 capitalize transition-colors ${
              activeAttTab === tab ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}>
            {tab === "overview" ? "Overview" : "Full History"}
          </button>
        ))}
      </div>

      {activeAttTab === "overview" && (
        <div className="space-y-5">
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Attendance %",  value: `${MOCK_ATTENDANCE.percentage}%`, color: pctColor(MOCK_ATTENDANCE.percentage), bg: "bg-white border" },
              { label: "Present Days",  value: MOCK_ATTENDANCE.presentDays,  color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Absent Days",   value: MOCK_ATTENDANCE.absentDays,   color: "text-rose-600",    bg: "bg-rose-50"    },
              { label: "Late Days",     value: MOCK_ATTENDANCE.lateDays,     color: "text-amber-600",   bg: "bg-amber-50"   },
            ].map((s, i) => (
              <Card key={i} className={`border-none shadow-sm ${s.bg}`}>
                <CardContent className="p-5 text-center">
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Progress bar */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">Overall Attendance</span>
                <span className={`text-sm font-bold ${pctColor(MOCK_ATTENDANCE.percentage)}`}>{MOCK_ATTENDANCE.percentage}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-4">
                <div className={`h-4 rounded-full transition-all ${pctBg(MOCK_ATTENDANCE.percentage)}`}
                  style={{ width: `${MOCK_ATTENDANCE.percentage}%` }} />
              </div>
              {MOCK_ATTENDANCE.percentage < 75 && (
                <p className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Below 75% threshold — please attend more classes.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Weekly Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={MOCK_WEEKLY} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="present" fill="#6366f1" radius={[4,4,0,0]} name="Present" />
                    <Bar dataKey="absent"  fill="#f43f5e" radius={[4,4,0,0]} name="Absent"  />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Distribution</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-6">
                <PieChart width={130} height={130}>
                  <Pie data={pieData} cx={60} cy={60} innerRadius={38} outerRadius={58} dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                </PieChart>
                <div className="space-y-3 flex-1">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i] }} />
                        <span className="text-slate-600">{d.name}</span>
                      </div>
                      <span className="font-bold text-slate-800">{d.value} days</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Per-course breakdown */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Per-Course Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {MOCK_PERFORMANCE_COURSES.map(c => (
                <div key={c.courseId}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{c.courseName}</span>
                    <span className={`font-bold ${pctColor(c.attendancePercentage)}`}>{c.attendancePercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full ${pctBg(c.attendancePercentage)}`}
                      style={{ width: `${c.attendancePercentage}%` }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{c.classesAttended} / {c.totalClasses} classes attended</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeAttTab === "history" && (
        <Card className="border-none shadow-sm">
          <CardHeader className="bg-slate-50 py-3 px-5">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Attendance History ({MOCK_ATTENDANCE.logs.length} records)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {MOCK_ATTENDANCE.logs.map((log, i) => (
              <div key={log.id} className={`flex items-center justify-between px-5 py-3.5 border-b last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                <div className="flex items-center gap-3">
                  {log.status === "PRESENT" && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                  {log.status === "ABSENT"  && <XCircle    className="w-4 h-4 text-rose-500"    />}
                  {log.status === "LATE"    && <Clock      className="w-4 h-4 text-amber-500"   />}
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {new Date(log.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <p className="text-xs text-slate-400">{log.courseName}</p>
                  </div>
                </div>
                <Badge className={
                  log.status === "PRESENT" ? "bg-emerald-100 text-emerald-700" :
                  log.status === "ABSENT"  ? "bg-rose-100 text-rose-700" :
                  "bg-amber-100 text-amber-700"
                }>{log.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );

  // -- PERFORMANCE ------------------------------------------------------------
  const renderPerformance = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-indigo-600" /> My Performance
        </h1>
        <p className="text-slate-500 text-sm mt-1">Assignment scores, grades and course-wise analytics</p>
      </div>

      {/* Overall stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Overall Avg",    value: "78%",  color: "text-indigo-600",  bg: "bg-indigo-50",  icon: Target  },
          { label: "Class Rank",     value: "#4",   color: "text-amber-600",   bg: "bg-amber-50",   icon: Award   },
          { label: "Assignments",    value: "10",   color: "text-blue-600",    bg: "bg-blue-50",    icon: BookOpen },
          { label: "Graded",         value: "8",    color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <Card key={label} className={`border-none shadow-sm ${bg}`}>
            <CardContent className="p-5 flex items-center gap-3">
              <Icon className={`w-8 h-8 ${color} opacity-80`} />
              <div>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Score trend */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Score Trend Across Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={MOCK_SCORE_TREND} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip formatter={(v: any) => [`${v}%`, "Score"]} />
              <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 5, fill: "#6366f1" }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Course tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {MOCK_PERFORMANCE_COURSES.map(c => (
          <button key={c.courseId} onClick={() => setActivePerfCourse(c.courseId)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activePerfCourse === c.courseId ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}>
            {c.courseName}
          </button>
        ))}
      </div>

      {/* Active course detail */}
      <div className="space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Attendance",   value: `${activeCourse.attendancePercentage}%`, color: pctColor(activeCourse.attendancePercentage), bg: activeCourse.attendancePercentage >= 75 ? "bg-emerald-50" : "bg-rose-50" },
            { label: "Avg Score",    value: `${activeCourse.averageScore}%`,          color: "text-indigo-600",  bg: "bg-indigo-50"  },
            { label: "Submitted",    value: `${activeCourse.submitted}/${activeCourse.totalAssignments}`, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Classes",      value: `${activeCourse.classesAttended}/${activeCourse.totalClasses}`, color: "text-slate-700", bg: "bg-slate-50" },
          ].map((s, i) => (
            <Card key={i} className={`border-none shadow-sm ${s.bg}`}>
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
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

        {/* Score bar chart */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Assignment Scores — {activeCourse.courseName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={activeCourse.assignments.filter(a => a.score !== null).map(a => ({
                  name: a.title.length > 12 ? a.title.slice(0, 12) + "…" : a.title,
                  score: a.percentage ?? 0,
                }))}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(v: any) => [`${v}%`, "Score"]} />
                <Bar dataKey="score" fill="#6366f1" radius={[4,4,0,0]} name="Score %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Assignment table */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50 py-3 px-5">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              All Assignments — {activeCourse.courseName}
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  {["Assignment", "Max", "Score", "%", "Status"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeCourse.assignments.map((a, i) => (
                  <tr key={a.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="px-4 py-3 font-medium text-slate-800">{a.title}</td>
                    <td className="px-4 py-3 text-center text-slate-500">{a.maxScore}</td>
                    <td className="px-4 py-3 text-center font-semibold text-indigo-600">
                      {a.score !== null ? a.score : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {a.percentage !== null
                        ? <span className={`font-bold ${pctColor(a.percentage)}`}>{a.percentage}%</span>
                        : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={
                        a.evaluationStatus === "EVALUATED" ? "bg-emerald-100 text-emerald-700" :
                        a.evaluationStatus === "SUBMITTED" ? "bg-blue-100 text-blue-700" :
                        "bg-slate-100 text-slate-500"
                      }>{a.evaluationStatus}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );

  // -- ROUTER -----------------------------------------------------------------
  const renderModule = () => {
    switch (activeModule) {
      case "lms":         return <LMSModule role={user.role} />;
      case "attendance":  return renderAttendance();
      case "performance": return renderPerformance();
      case "fees":        return <FeePaymentManagement role={user.role} />;
      default:            return renderDashboard();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={user.role} activeModule={activeModule} onModuleChange={setActiveModule} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={onLogout} />
        <main className="flex-1 p-6 overflow-y-auto">
          {renderModule()}
        </main>
      </div>
    </div>
  );
}
