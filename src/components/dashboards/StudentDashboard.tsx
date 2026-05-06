import { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  BookOpen, Calendar, TrendingUp, DollarSign
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from "recharts";
import API from "../../api/axios";
import { User } from "../../types";

interface Props {
  user: User;
  onLogout: () => void;
}

export function StudentDashboard({ user }: Props) {

  const [attendance, setAttendance] = useState<any>(null);
  const [performance, setPerformance] = useState<any[]>([]);
  const [fees, setFees] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ================= LOAD REAL DATA =================
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // auto refresh
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [att, perf, fee] = await Promise.all([
        API.get("/api/student/attendance"),
        API.get("/api/student/performance"),
        API.get("/api/student/fees")
      ]);

      setAttendance(att.data);
      setPerformance(perf.data || []);
      setFees(fee.data);

    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  // ================= SAFE FALLBACK =================
  if (!attendance || !fees) {
    return (
      <div className="p-6">
        <p className="text-red-500">No data available</p>
      </div>
    );
  }

  // ================= DERIVED DATA =================
  const weeklyData = attendance?.weekly || [];

  const scoreTrend = performance.flatMap((c: any) =>
    (c.assignments || []).map((a: any) => ({
      name: a.title,
      score: a.score || 0
    }))
  );

  const feeProgress = fees.totalFee
    ? Math.round((fees.paidAmount / fees.totalFee) * 100)
    : 0;

  // ================= UI =================
  return (
    <div className="p-6 space-y-6 bg-[#fbfff1] min-h-screen">

      {/* HEADER */}
      <h1 className="text-2xl font-bold text-[#3c3744]">
        Welcome, {user.name}
      </h1>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <Card>
          <CardContent className="p-4">
            <p className="text-sm">Attendance</p>
            <p className="text-xl font-bold text-blue-600">
              {attendance.percentage || 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm">Courses</p>
            <p className="text-xl font-bold text-indigo-600">
              {performance.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm">Fee Paid</p>
            <p className="text-xl font-bold text-green-600">
              ₹ {fees.paidAmount || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm">Pending</p>
            <p className="text-xl font-bold text-red-600">
              ₹ {fees.pendingAmount || 0}
            </p>
          </CardContent>
        </Card>

      </div>

      {/* CHARTS */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Attendance Chart */}
        <Card>
          <CardContent>
            <p className="font-semibold mb-2">Weekly Attendance</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present" />
                <Bar dataKey="absent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Score Trend */}
        <Card>
          <CardContent>
            <p className="font-semibold mb-2">Score Trend</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={scoreTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

      {/* FEES */}
      <Card>
        <CardContent className="space-y-3">
          <p className="font-semibold">Fee Status</p>

          <div className="flex justify-between text-sm">
            <span>Total</span>
            <span>₹ {fees.totalFee}</span>
          </div>

          <Progress value={feeProgress} />

          <div className="flex justify-between text-sm">
            <span>Paid</span>
            <span className="text-green-600">₹ {fees.paidAmount}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Pending</span>
            <span className="text-red-600">₹ {fees.pendingAmount}</span>
          </div>
        </CardContent>
      </Card>

      {/* COURSES */}
      <Card>
        <CardContent>
          <p className="font-semibold mb-3">My Courses</p>

          {performance.length === 0 ? (
            <p className="text-gray-400">No courses found</p>
          ) : performance.map((c: any) => (
            <div key={c.courseId} className="mb-3 p-3 border rounded-lg">
              <div className="flex justify-between">
                <p className="font-medium">{c.courseName}</p>
                <Badge>{c.attendancePercentage}%</Badge>
              </div>
              <p className="text-sm text-gray-500">
                Avg Score: {c.averageScore}%
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}