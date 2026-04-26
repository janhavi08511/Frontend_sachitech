import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { TrendingUp, Users, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import {
  getReportSummary,
  getStudentReport,
  getRevenueReport,
  getCourseReport
} from '../../api/reportApi';

const fmt = (v: number) => {
  if (!v) return "₹0";
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${v}`;
};

export function ReportsModule() {
  const [summary, setSummary] = useState<any>(null);
  const [studentReport, setStudentReport] = useState<any[]>([]);
  const [revenueReport, setRevenueReport] = useState<any[]>([]);
  const [courseReport, setCourseReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, st, rv, cr] = await Promise.all([
        getReportSummary(),
        getStudentReport(),
        getRevenueReport(),
        getCourseReport(),
      ]);

      setSummary(s);

      // ✅ FIX STUDENT KEYS
      setStudentReport(
        (st || []).map((x: any) => ({
          month: x.month,
          enrolled: x.totalStudents || x.enrolled || 0,
          active: x.active || 0,
          inactive: x.inactive || 0,
        }))
      );

      // ✅ FIX REVENUE KEYS
      setRevenueReport(
        (rv || []).map((x: any) => ({
          month: x.month,
          collected: x.collected || 0,
          pending: x.pending || 0,
          transactions: x.transactionCount || x.transactions || 0,
        }))
      );

      // ✅ FIX COURSE KEYS
      setCourseReport(
        (cr || []).map((x: any) => ({
          courseName: x.courseName,
          enrolled: x.totalStudents || x.enrolled || 0,
          expectedRevenue: x.expectedRevenue || 0,
          collectedRevenue: x.collectedRevenue || 0,
          pendingRevenue: x.pendingRevenue || 0,
          duration: x.duration || '',
          courseFee: x.courseFee || 0,
        }))
      );

    } catch (e) {
      console.error("Report load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const feeCollectionPie = summary
    ? [
        { name: 'Collected', value: summary.totalRevenue || 0, color: '#10b981' },
        { name: 'Pending', value: summary.totalPending || 0, color: '#f59e0b' },
      ]
    : [];

  if (loading) return <p className="text-center py-10">Loading...</p>;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Reports Dashboard</h1>
        <Button onClick={loadAll}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* SUMMARY */}
      {summary && (
        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="p-4">
            <p>Total Students</p>
            <h2 className="text-xl font-bold">{summary.totalStudents}</h2>
          </CardContent></Card>

          <Card><CardContent className="p-4">
            <p>Revenue</p>
            <h2 className="text-xl font-bold text-green-600">{fmt(summary.totalRevenue)}</h2>
          </CardContent></Card>

          <Card><CardContent className="p-4">
            <p>Pending</p>
            <h2 className="text-xl font-bold text-orange-600">{fmt(summary.totalPending)}</h2>
          </CardContent></Card>

          <Card><CardContent className="p-4">
            <p>Placements</p>
            <h2 className="text-xl font-bold">{summary.totalPlacements}</h2>
          </CardContent></Card>
        </div>
      )}

      <Tabs defaultValue="analytics">

        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        {/* ANALYTICS */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-2 gap-6">

            {/* STUDENT TREND */}
            <Card>
              <CardHeader><CardTitle>Student Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={studentReport}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line dataKey="enrolled" stroke="#3b82f6" />
                    <Line dataKey="active" stroke="#10b981" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* REVENUE TREND */}
            <Card>
              <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={revenueReport}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line dataKey="collected" stroke="#10b981" />
                    <Line dataKey="pending" stroke="#f59e0b" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        {/* REVENUE */}
        <TabsContent value="revenue">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueReport}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="collected" fill="#10b981" />
              <Bar dataKey="pending" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        {/* COURSES */}
        <TabsContent value="courses">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={courseReport}>
              <XAxis dataKey="courseName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="enrolled" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        {/* STUDENTS */}
        <TabsContent value="students">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studentReport}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="enrolled" fill="#3b82f6" />
              <Bar dataKey="active" fill="#10b981" />
              <Bar dataKey="inactive" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

      </Tabs>
    </div>
  );
}