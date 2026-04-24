import React, { useEffect, useState } from "react";
import {
  TrendingUp, Award, FileText, Target, Search,
  Bell, Download
} from "lucide-react";

import {
  getAllStudents,
  getCourses,
  getPerformance,
  getSkills,
  getLeaderboard,
  getAIInsight
} from "../../api/performanceApi";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

export function PerformanceTracking() {

  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  const [selectedStudent, setSelectedStudent] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("");

  const [performance, setPerformance] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [insight, setInsight] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  // 🚀 LOAD INITIAL
  useEffect(() => {
    loadInitial();
  }, []);

  const loadInitial = async () => {
    const [s, c] = await Promise.all([
      getAllStudents(),
      getCourses()
    ]);

    setStudents(s);
    setCourses(c);

    if (c.length > 0) setSelectedCourse(c[0].id);
  };

  // 🚀 LOAD DATA
  useEffect(() => {
    if (selectedStudent !== "all" && selectedCourse) {
      loadStudentData();
    }
    if (selectedCourse) {
      loadLeaderboard();
    }
  }, [selectedStudent, selectedCourse]);

  const loadStudentData = async () => {
    const [p, sk, ai] = await Promise.all([
      getPerformance(selectedStudent, selectedCourse),
      getSkills(selectedStudent),
      getAIInsight(selectedStudent, selectedCourse)
    ]);

    setPerformance(p.data);
    setSkills(sk.data);
    setInsight(ai);
  };

  const loadLeaderboard = async () => {
    const lb = await getLeaderboard(selectedCourse);
    setLeaderboard(lb);
  };

  // 🔍 FILTER
  const filteredStudents = students.filter((s) =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between">

        <h1 className="text-2xl font-semibold">
          Performance Analytics 🚀
        </h1>

        <div className="flex gap-3">

          <input
            placeholder="Search..."
            className="border p-2 rounded"
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select onChange={(e)=>setSelectedStudent(e.target.value)}>
            <option value="all">All Students</option>
            {filteredStudents.map(s=>(
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <select onChange={(e)=>setSelectedCourse(e.target.value)}>
            {courses.map(c=>(
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <button className="bg-green-600 text-white px-3 py-2 rounded">
            <Download size={16}/> Report
          </button>

          <button className="bg-blue-600 text-white px-3 py-2 rounded">
            <Bell size={16}/> Notify
          </button>

        </div>
      </div>

      {/* STUDENT VIEW */}
      {selectedStudent !== "all" && performance && (

        <div className="bg-white p-6 rounded shadow">

          <h2 className="text-xl font-semibold mb-4">
            Student Performance
          </h2>

          <div className="grid grid-cols-4 gap-4">

            <StatCard value={`${performance.averageScore}%`} label="Score" />
            <StatCard value={`${performance.attendancePercentage}%`} label="Attendance" />
            <StatCard value={performance.classRank} label="Rank" />
            <StatCard value={skills.length} label="Skills" />

          </div>

          {/* CHART */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={skills}>
              <XAxis dataKey="skillName"/>
              <YAxis/>
              <Tooltip/>
              <Bar dataKey="skillRating"/>
            </BarChart>
          </ResponsiveContainer>

          {/* AI */}
          <div className="bg-yellow-100 p-4 mt-4 rounded">
            <strong>AI Insight:</strong> {insight}
          </div>

        </div>
      )}

      {/* LEADERBOARD */}
      {selectedStudent === "all" && (
        <div className="bg-white p-6 rounded shadow">

          <h2 className="text-lg font-semibold mb-4">
            🏆 Leaderboard
          </h2>

          {[...leaderboard].reverse().map((l:any, i:number)=>(
            <div key={i} className="flex justify-between border-b p-2">
              <span>{i+1}. {l.studentName}</span>
              <span>{l.averageScore}</span>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}

function StatCard({ value, label }: any) {
  return (
    <div className="p-4 bg-blue-50 rounded">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-sm">{label}</p>
    </div>
  );
}