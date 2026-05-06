import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Download, Filter, Users, DollarSign, GraduationCap } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

import * as reportApi from "../../api/reportApi";

export function AdvancedReportBuilder({ userRole }: any) {

  const [reportType, setReportType] = useState("student");
  const [activeView, setActiveView] = useState("preview");

  // ✅ BACKEND DATA
  const [studentData, setStudentData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [courseData, setCourseData] = useState<any[]>([]);

  // ✅ LOAD DATA
  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const [s, r, c] = await Promise.all([
        reportApi.getStudentReport(),
        reportApi.getRevenueReport(),
        reportApi.getCourseReport(),
      ]);

      setStudentData(s || []);
      setRevenueData(r || []);
      setCourseData(c || []);

    } catch (e) {
      console.error("Report API error", e);
    }
  };

  // ✅ EXPORT CSV
  const exportCSV = (data: any[]) => {
    if (!data || !Array.isArray(data) || !data.length) return;

    const csv = [
      Object.keys(data[0]).join(","),
      ...data.map(row => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "report.csv";
    a.click();
  };

  const renderPreview = () => {
    switch (reportType) {

      case "student":
        return (
          <Card>
            <CardHeader><CardTitle>Student Report</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={studentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="enrolled" fill="#3b82f6" />
                  <Bar dataKey="completed" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      case "revenue":
        return (
          <Card>
            <CardHeader><CardTitle>Revenue</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line dataKey="collected" stroke="#10b981" name="Collected" />
                  <Line dataKey="pending" stroke="#f59e0b" name="Pending" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      case "course":
        return (
          <Card>
            <CardHeader><CardTitle>Course Report</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={courseData} dataKey="enrolled" nameKey="courseName">
                    {courseData.map((_, i) => (
                      <Cell key={i} fill={["#3b82f6","#8b5cf6","#10b981","#f59e0b"][i % 4]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any, name: any) => [v, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      default:
        return <p>Select Report</p>;
    }
  };

  return (
    <div className="space-y-6">

      <div className="flex justify-between">
        <h2 className="text-2xl font-semibold">Advanced Report Builder</h2>

        <Button onClick={() => exportCSV(studentData)}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-6">

        <Card>
          <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
          <CardContent>
            <Label>Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="course">Course</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="col-span-3">
          <Tabs value={activeView} onValueChange={setActiveView}>
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
            </TabsList>

            <TabsContent value="preview">{renderPreview()}</TabsContent>

            <TabsContent value="data">
              <pre className="p-4 bg-gray-100 rounded">
                {JSON.stringify(studentData, null, 2)}
              </pre>
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
}