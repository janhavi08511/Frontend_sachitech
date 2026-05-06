import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "../ui/table";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  TrendingUp, Download, Calendar, Users, DollarSign, AlertCircle
} from "lucide-react";
import { getAllStudents } from "../../api/studentApi";
import { getAllStudentFeeStatus, getAllTransactions } from "../../api/feeApi";
import { getCourses } from "../../api/courseApi";
import { toast } from "sonner";

interface AnalyticsData {
  totalStudents: number;
  totalCourses: number;
  totalFeeCollected: number;
  totalPendingFees: number;
  collectionRate: number;
  studentsByStatus: any[];
  feeByStatus: any[];
  monthlyCollection: any[];
  courseWiseFees: any[];
  topPendingStudents: any[];
}

export function AnalyticsReporting() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("all");

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [students, feeStatus, transactions, courses] = await Promise.all([
        getAllStudents(),
        getAllStudentFeeStatus(),
        getAllTransactions(),
        getCourses()
      ]);

      const studentList = Array.isArray(students) ? students : students?.data || [];
      const feeList = Array.isArray(feeStatus) ? feeStatus : feeStatus?.data || [];
      const txList = Array.isArray(transactions) ? transactions : transactions?.data || [];
      const courseList = Array.isArray(courses) ? courses : courses?.data || [];

      // Calculate analytics
      const totalStudents = studentList.length;
      const totalCourses = courseList.length;
      
      const totalFeeCollected = feeList.reduce((sum: number, f: any) => sum + (f.paidAmount || 0), 0);
      const totalPendingFees = feeList.reduce((sum: number, f: any) => sum + (f.pendingAmount || 0), 0);
      const totalFees = feeList.reduce((sum: number, f: any) => sum + (f.totalFees || 0), 0);
      const collectionRate = totalFees > 0 ? Math.round((totalFeeCollected / totalFees) * 100) : 0;

      // Students by status
      const paidStudents = feeList.filter((f: any) => f.pendingAmount === 0).length;
      const pendingStudents = feeList.filter((f: any) => f.pendingAmount > 0).length;

      const studentsByStatus = [
        { name: "Paid", value: paidStudents, color: "#10b981" },
        { name: "Pending", value: pendingStudents, color: "#ef4444" }
      ];

      // Fee by status
      const feeByStatus = [
        { name: "Collected", value: totalFeeCollected, color: "#10b981" },
        { name: "Pending", value: totalPendingFees, color: "#ef4444" }
      ];

      // Monthly collection (from transactions)
      const monthlyMap: Record<string, number> = {};
      txList.forEach((tx: any) => {
        const month = tx.paymentDate?.substring(0, 7) || "Unknown";
        monthlyMap[month] = (monthlyMap[month] || 0) + (tx.installmentAmount || 0);
      });
      const monthlyCollection = Object.entries(monthlyMap)
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => a.month.localeCompare(b.month));

      // Course-wise fees
      const courseWiseFees = (courseList || []).map((course: any) => {
        const courseFees = (feeList || []).filter((f: any) => f.courseName === course.name);
        const collected = courseFees.reduce((sum: number, f: any) => sum + (f.paidAmount || 0), 0);
        const pending = courseFees.reduce((sum: number, f: any) => sum + (f.pendingAmount || 0), 0);
        return {
          name: course.name,
          collected,
          pending,
          total: collected + pending
        };
      });

      // Top pending students
      const topPendingStudents = (feeList || [])
        .filter((f: any) => f.pendingAmount > 0)
        .sort((a: any, b: any) => b.pendingAmount - a.pendingAmount)
        .slice(0, 5);

      setAnalytics({
        totalStudents,
        totalCourses,
        totalFeeCollected,
        totalPendingFees,
        collectionRate,
        studentsByStatus,
        feeByStatus,
        monthlyCollection,
        courseWiseFees,
        topPendingStudents
      });
    } catch (error) {
      console.error("Analytics load error:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    if (!analytics) return;

    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SachITech Analytics Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
          .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
          h1 { color: #333; border-bottom: 3px solid #4f46e5; padding-bottom: 10px; }
          h2 { color: #4f46e5; margin-top: 30px; }
          .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
          .stat-card { background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #4f46e5; }
          .stat-value { font-size: 28px; font-weight: bold; color: #4f46e5; }
          .stat-label { color: #666; font-size: 14px; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #4f46e5; color: white; padding: 12px; text-align: left; }
          td { padding: 12px; border-bottom: 1px solid #ddd; }
          tr:hover { background: #f9fafb; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
          .chart-section { margin: 30px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📊 SachITech Analytics & Reporting</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>

          <h2>📈 Key Metrics</h2>
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${analytics.totalStudents}</div>
              <div class="stat-label">Total Students</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${analytics.totalCourses}</div>
              <div class="stat-label">Total Courses</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">₹${analytics.totalFeeCollected.toLocaleString()}</div>
              <div class="stat-label">Fee Collected</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${analytics.collectionRate}%</div>
              <div class="stat-label">Collection Rate</div>
            </div>
          </div>

          <h2>💰 Financial Summary</h2>
          <table>
            <tr>
              <th>Metric</th>
              <th>Amount</th>
              <th>Percentage</th>
            </tr>
            <tr>
              <td>Total Fee Collected</td>
              <td>₹${analytics.totalFeeCollected.toLocaleString()}</td>
              <td>${analytics.collectionRate}%</td>
            </tr>
            <tr>
              <td>Total Pending Fees</td>
              <td>₹${analytics.totalPendingFees.toLocaleString()}</td>
              <td>${100 - analytics.collectionRate}%</td>
            </tr>
            <tr>
              <td>Total Expected Revenue</td>
              <td>₹${(analytics.totalFeeCollected + analytics.totalPendingFees).toLocaleString()}</td>
              <td>100%</td>
            </tr>
          </table>

          <h2>📚 Course-wise Fee Analysis</h2>
          <table>
            <tr>
              <th>Course Name</th>
              <th>Collected</th>
              <th>Pending</th>
              <th>Total</th>
              <th>Collection %</th>
            </tr>
            ${analytics.courseWiseFees.map(course => `
              <tr>
                <td>${course.name}</td>
                <td>₹${course.collected.toLocaleString()}</td>
                <td>₹${course.pending.toLocaleString()}</td>
                <td>₹${course.total.toLocaleString()}</td>
                <td>${course.total > 0 ? Math.round((course.collected / course.total) * 100) : 0}%</td>
              </tr>
            `).join('')}
          </table>

          <h2>⚠️ Top 5 Students with Pending Fees</h2>
          <table>
            <tr>
              <th>Student Name</th>
              <th>Course</th>
              <th>Pending Amount</th>
              <th>Status</th>
            </tr>
            ${analytics.topPendingStudents.map(student => `
              <tr>
                <td>${student.studentName}</td>
                <td>${student.courseName}</td>
                <td>₹${student.pendingAmount.toLocaleString()}</td>
                <td><span style="background: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 4px;">Pending</span></td>
              </tr>
            `).join('')}
          </table>

          <h2>📊 Student Payment Status</h2>
          <table>
            <tr>
              <th>Status</th>
              <th>Count</th>
              <th>Percentage</th>
            </tr>
            <tr>
              <td>Fully Paid</td>
              <td>${analytics.studentsByStatus[0]?.value || 0}</td>
              <td>${analytics.totalStudents > 0 ? Math.round(((analytics.studentsByStatus[0]?.value || 0) / analytics.totalStudents) * 100) : 0}%</td>
            </tr>
            <tr>
              <td>Pending Payment</td>
              <td>${analytics.studentsByStatus[1]?.value || 0}</td>
              <td>${analytics.totalStudents > 0 ? Math.round(((analytics.studentsByStatus[1]?.value || 0) / analytics.totalStudents) * 100) : 0}%</td>
            </tr>
          </table>

          <div class="footer">
            <p>This is an automated report generated by SachITech Analytics System.</p>
            <p>For more information, contact the administration.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([reportHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SachITech_Report_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded successfully!");
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
        <p className="text-gray-600">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex gap-2 items-center">
          <TrendingUp className="text-indigo-600" />
          Analytics & Reporting
        </h1>
        <Button onClick={generateReport} className="gap-2">
          <Download className="w-4 h-4" />
          Download Report
        </Button>
      </div>

      {/* KEY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-indigo-600">{analytics.totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-indigo-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-3xl font-bold text-blue-600">{analytics.totalCourses}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Fee Collected</p>
                <p className="text-3xl font-bold text-green-600">₹{(analytics.totalFeeCollected / 100000).toFixed(1)}L</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Collection Rate</p>
                <p className="text-3xl font-bold text-purple-600">{analytics.collectionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABS */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Course Analysis</TabsTrigger>
          <TabsTrigger value="pending">Pending Fees</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Status Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Student Payment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.studentsByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.studentsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Fee Status Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Fee Collection Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.feeByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ₹${(value / 100000).toFixed(1)}L`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.feeByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Collection Line Chart */}
          {analytics.monthlyCollection.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Fee Collection Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.monthlyCollection}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      dot={{ fill: "#4f46e5", r: 5 }}
                      activeDot={{ r: 7 }}
                      name="Collection Amount"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* COURSE ANALYSIS TAB */}
        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course-wise Fee Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.courseWiseFees}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="collected" fill="#10b981" name="Collected" />
                  <Bar dataKey="pending" fill="#ef4444" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course-wise Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Name</TableHead>
                    <TableHead className="text-right">Collected</TableHead>
                    <TableHead className="text-right">Pending</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Collection %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.courseWiseFees.map((course, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{course.name}</TableCell>
                      <TableCell className="text-right text-green-600">₹{course.collected.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-red-600">₹{course.pending.toLocaleString()}</TableCell>
                      <TableCell className="text-right">₹{course.total.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Badge className={course.total > 0 && (course.collected / course.total) > 0.8 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                          {course.total > 0 ? Math.round((course.collected / course.total) * 100) : 0}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PENDING FEES TAB */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Top Students with Pending Fees</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead className="text-right">Pending Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.topPendingStudents.map((student, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{student.studentName}</TableCell>
                      <TableCell>{student.courseName}</TableCell>
                      <TableCell className="text-right font-semibold text-red-600">₹{student.pendingAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-800">Pending</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
