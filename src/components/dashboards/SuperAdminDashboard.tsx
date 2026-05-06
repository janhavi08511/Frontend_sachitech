import { useState, useEffect } from 'react';
import { Header } from '../layout/Header';
import { Sidebar } from '../layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Users, GraduationCap, DollarSign, TrendingUp, UserCheck, BookOpen, Briefcase, ArrowUp, AlertCircle, RefreshCw, Download } from 'lucide-react';
import { User } from '../../types';
import { UserManagement } from '../modules/UserManagement';
import { StudentManagement } from '../modules/StudentManagement';
import { CourseManagement } from '../modules/CourseManagement';
import { LMSModule } from '../modules/LMSModule';
import { AttendanceModule } from '../modules/AttendanceModule';
import { PerformanceModule } from '../modules/PerformanceModule';
import { InternshipModule } from '../modules/InternshipModule';
import { FeeManagement } from '../modules/FeeManagement';

import { ReportsModule } from '../modules/ReportsModule';
import { AnalyticsReporting } from '../modules/AnalyticsReporting';

import { CommandPalette } from '../advanced/CommandPalette';
import { AdvancedReportBuilder } from '../advanced/AdvancedReportBuilder';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import { getReportSummary, getStudentReport, getRevenueReport, getCourseReport, downloadMonthlyReport } from '../../api/reportApi';
import { getAllStudentFeeStatus } from '../../api/feeApi';

interface SuperAdminDashboardProps {
  user: User;
  onLogout: () => void;
  onNavigate: (route: any) => void;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

const fmt = (v: number) => {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${Math.round(v).toLocaleString()}`;
};

export function SuperAdminDashboard({ user, onLogout }: SuperAdminDashboardProps) {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Real data state
  const [summary, setSummary] = useState<any>(null);
  const [studentReport, setStudentReport] = useState<any[]>([]);
  const [revenueReport, setRevenueReport] = useState<any[]>([]);
  const [courseReport, setCourseReport] = useState<any[]>([]);
  const [feeStatus, setFeeStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeModule === 'dashboard') loadDashboard();
  }, [activeModule]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [s, sr, rr, cr, fs] = await Promise.all([
        getReportSummary().catch(() => null),
        getStudentReport().catch(() => []),
        getRevenueReport().catch(() => []),
        getCourseReport().catch(() => []),
        getAllStudentFeeStatus().catch(() => []),
      ]);
      setSummary(s || null);
      setStudentReport(Array.isArray(sr) ? sr : []);
      setRevenueReport(Array.isArray(rr) ? rr : []);
      setCourseReport(Array.isArray(cr) ? cr : []);
      setFeeStatus(Array.isArray(fs) ? fs : []);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (format: 'pdf' | 'excel' = 'pdf') => {
    const now = new Date();
    await downloadMonthlyReport(now.getMonth() + 1, now.getFullYear(), format);
  };

  // Fee pie data
  const feePie = [
    { name: 'Collected', value: summary?.totalRevenue || 0, color: '#10b981' },
    { name: 'Pending', value: summary?.totalPending || 0, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  // Course distribution for pie
  const coursePie = courseReport.map((c: any, i: number) => ({
    name: c.courseName,
    value: c.enrolled,
    color: COLORS[i % COLORS.length],
  })).filter((c: any) => c.value > 0);

  // Pending students
  const pendingStudents = feeStatus.filter((s: any) => s.feeStatus === 'pending' || s.feeStatus === 'partial');

  const renderDashboard = () => {
    if (loading) return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );

    return (
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Super Admin Dashboard</h1>
            <p className="text-muted-foreground">Real-time overview of institute operations</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadDashboard}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Total Students', value: summary?.totalStudents ?? '-',
              sub: `${summary?.totalCourses ?? 0} courses`,
              icon: Users, gradient: 'from-blue-500 to-blue-600', bg: 'from-blue-50 to-blue-100/50',
            },
            {
              title: 'Total Revenue', value: fmt(summary?.totalRevenue || 0),
              sub: `This month: ${fmt(summary?.thisMonthRevenue || 0)}`,
              icon: DollarSign, gradient: 'from-green-500 to-green-600', bg: 'from-green-50 to-green-100/50',
            },
            {
              title: 'Pending Dues', value: fmt(summary?.totalPending || 0),
              sub: `${pendingStudents.length} students pending`,
              icon: AlertCircle, gradient: 'from-orange-500 to-orange-600', bg: 'from-orange-50 to-orange-100/50',
            },
            {
              title: 'Placements', value: summary?.totalPlacements ?? '-',
              sub: `${summary?.ongoingInternships ?? 0} internships ongoing`,
              icon: Briefcase, gradient: 'from-emerald-500 to-emerald-600', bg: 'from-emerald-50 to-emerald-100/50',
            },
            {
              title: 'Total Payments', value: summary?.totalPayments ?? '-',
              sub: 'All transactions',
              icon: TrendingUp, gradient: 'from-purple-500 to-purple-600', bg: 'from-purple-50 to-purple-100/50',
            },
            {
              title: 'Active Courses', value: summary?.totalCourses ?? '-',
              sub: `${courseReport.length} with enrollments`,
              icon: GraduationCap, gradient: 'from-cyan-500 to-cyan-600', bg: 'from-cyan-50 to-cyan-100/50',
            },
            {
              title: 'Fully Paid', value: feeStatus.filter((s: any) => s.feeStatus === 'paid').length,
              sub: 'Students with no dues',
              icon: UserCheck, gradient: 'from-teal-500 to-teal-600', bg: 'from-teal-50 to-teal-100/50',
            },
            {
              title: 'Courses Offered', value: courseReport.length,
              sub: `Total enrolled: ${courseReport.reduce((s: number, c: any) => s + c.enrolled, 0)}`,
              icon: BookOpen, gradient: 'from-pink-500 to-pink-600', bg: 'from-pink-50 to-pink-100/50',
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className={`border-0 bg-gradient-to-br ${stat.bg}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <ArrowUp className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Manage Students', icon: Users, module: 'students' },
                { label: 'Manage Courses', icon: GraduationCap, module: 'courses' },
                { label: 'View Reports', icon: TrendingUp, module: 'reports' },
                { label: 'Manage Users', icon: UserCheck, module: 'users' },
              ].map((a, i) => (
                <Button key={i} variant="outline" className="h-auto flex-col py-4 gap-2" onClick={() => setActiveModule(a.module)}>
                  <a.icon className="w-5 h-5" />
                  <span className="text-sm">{a.label}</span>
                </Button>
              ))}
              <Button variant="outline" className="h-auto flex-col py-4 gap-2" onClick={() => handleDownloadReport('pdf')}>
                <Download className="w-5 h-5 text-red-500" />
                <span className="text-sm">Download PDF</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 gap-2" onClick={() => handleDownloadReport('excel')}>
                <Download className="w-5 h-5 text-green-600" />
                <span className="text-sm">Download Excel</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Admission Trend */}
          <Card>
            <CardHeader><CardTitle>Student Admissions by Month</CardTitle></CardHeader>
            <CardContent>
              {studentReport.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">No admission data available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={studentReport}>
                    <defs>
                      <linearGradient id="admGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="enrolled" fill="url(#admGrad)" radius={[6, 6, 0, 0]} name="Enrolled" />
                    <Bar dataKey="active" fill="#10b981" radius={[6, 6, 0, 0]} name="Active" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Revenue Trend */}
          <Card>
            <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
            <CardContent>
              {revenueReport.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">No revenue data available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={revenueReport}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="pendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => fmt(v)} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => fmt(v)} />
                    <Area type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={3} fill="url(#revGrad)" name="Collected" />
                    <Area type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} fill="url(#pendGrad)" name="Pending" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Course Distribution Pie */}
          <Card>
            <CardHeader><CardTitle>Course Distribution</CardTitle></CardHeader>
            <CardContent>
              {coursePie.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">No course data.</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={coursePie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                        {coursePie.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {coursePie.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="truncate max-w-[120px]">{item.name}</span>
                        </div>
                        <span className="font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Fee Collection Status */}
          <Card>
            <CardHeader><CardTitle>Fee Collection</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  { label: 'Total Collected', value: fmt(summary?.totalRevenue || 0), color: 'text-green-600', bg: 'bg-green-50' },
                  { label: 'This Month', value: fmt(summary?.thisMonthRevenue || 0), color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Pending Dues', value: fmt(summary?.totalPending || 0), color: 'text-orange-600', bg: 'bg-orange-50' },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${item.bg}`}>
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className={`font-bold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
              {feePie.length > 0 && (
                <div className="pt-2 border-t">
                  {feePie.map((item, i) => {
                    const total = feePie.reduce((s, d) => s + d.value, 0);
                    const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                    return (
                      <div key={i} className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{item.name}</span><span>{pct}%</span>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Student Fee Status */}
          <Card>
            <CardHeader><CardTitle>Student Fee Status</CardTitle></CardHeader>
            <CardContent>
              {feeStatus.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">No data.</p>
              ) : (
                <div className="space-y-3">
                  {[
                    { label: 'Fully Paid', count: feeStatus.filter((s: any) => s.feeStatus === 'paid').length, color: 'bg-green-100 text-green-700' },
                    { label: 'Partial', count: feeStatus.filter((s: any) => s.feeStatus === 'partial').length, color: 'bg-orange-100 text-orange-700' },
                    { label: 'Pending', count: feeStatus.filter((s: any) => s.feeStatus === 'pending').length, color: 'bg-red-100 text-red-700' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">{item.label}</span>
                      <Badge className={item.color}>{item.count} students</Badge>
                    </div>
                  ))}
                  <div className="pt-2 border-t text-sm text-muted-foreground text-center">
                    Total: {feeStatus.length} students
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Course Revenue Table */}
        <Card>
          <CardHeader><CardTitle>Course-wise Revenue Analysis</CardTitle></CardHeader>
          <CardContent>
            {courseReport.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">No course data available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left px-4 py-3">Course</th>
                      <th className="text-center px-4 py-3">Students</th>
                      <th className="text-right px-4 py-3">Course Fee</th>
                      <th className="text-right px-4 py-3">Expected</th>
                      <th className="text-right px-4 py-3">Collected</th>
                      <th className="text-right px-4 py-3">Pending</th>
                      <th className="text-center px-4 py-3">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseReport.map((c: any, i: number) => {
                      const pct = c.expectedRevenue > 0 ? Math.round((c.collectedRevenue / c.expectedRevenue) * 100) : 0;
                      return (
                        <tr key={i} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{c.courseName}</td>
                          <td className="px-4 py-3 text-center">{c.enrolled}</td>
                          <td className="px-4 py-3 text-right">₹{(c.courseFee || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-purple-600 font-medium">{fmt(c.expectedRevenue)}</td>
                          <td className="px-4 py-3 text-right text-green-600 font-medium">{fmt(c.collectedRevenue)}</td>
                          <td className="px-4 py-3 text-right text-orange-600 font-medium">{fmt(c.pendingRevenue)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Progress value={pct} className="h-2 flex-1" />
                              <span className="text-xs w-8">{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-semibold">
                      <td className="px-4 py-3">Total</td>
                      <td className="px-4 py-3 text-center">{courseReport.reduce((s: number, c: any) => s + c.enrolled, 0)}</td>
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3 text-right text-purple-600">{fmt(courseReport.reduce((s: number, c: any) => s + c.expectedRevenue, 0))}</td>
                      <td className="px-4 py-3 text-right text-green-600">{fmt(courseReport.reduce((s: number, c: any) => s + c.collectedRevenue, 0))}</td>
                      <td className="px-4 py-3 text-right text-orange-600">{fmt(courseReport.reduce((s: number, c: any) => s + c.pendingRevenue, 0))}</td>
                      <td className="px-4 py-3" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    );
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard': return renderDashboard();
      case 'users': return <UserManagement />;
      case 'students': return <StudentManagement />;
      case 'courses': return <CourseManagement />;
      case 'lms': return <LMSModule role={user.role} />;
      case 'attendance': return <AttendanceModule role={user.role} />;
      case 'performance': return <PerformanceModule />;
      case 'fees': return <FeeManagement />;
      case 'analytics': return <AnalyticsReporting />;
      case 'reports': return <AdvancedReportBuilder userRole={user.role} />;
   
      default: return renderDashboard();
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <CommandPalette onNavigate={setActiveModule} />
      <Sidebar role={user.role} activeModule={activeModule} onModuleChange={setActiveModule} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={onLogout} onOpenCommandPalette={() => setShowCommandPalette(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {renderModule()}
          </div>
        </main>
      </div>
    </div>
  );
}