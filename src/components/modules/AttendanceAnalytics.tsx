import { useEffect, useState } from "react";
import { getBatchSummary, getBatchAverage, getLowAttendance } from "../../api/attendanceApi";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function AttendanceAnalytics({ batchId }: any) {

  const [summary, setSummary] = useState<any[]>([]);
  const [average, setAverage] = useState(0);
  const [low, setLow] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, [batchId]);

  const load = async () => {
    const [s, a, l] = await Promise.all([
      getBatchSummary(batchId),
      getBatchAverage(batchId),
      getLowAttendance(batchId)
    ]);

    setSummary(s);
    setAverage(a);
    setLow(l);
  };

  return (
    <div className="space-y-6">

      <h2 className="text-xl font-bold">Attendance Analytics</h2>

      {/* AVG */}
      <p className="text-lg">Average Attendance: {average.toFixed(2)}%</p>

      {/* BAR CHART */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={summary}>
          <XAxis dataKey="studentName"/>
          <YAxis/>
          <Tooltip/>
          <Bar dataKey="attendancePercentage" />
        </BarChart>
      </ResponsiveContainer>

      {/* LOW ATTENDANCE */}
      <div>
        <h3 className="text-lg font-semibold text-red-600">Low Attendance</h3>
        {[...low].reverse().map((s:any)=>(
          <p key={s.studentId}>
            {s.studentName} - {s.attendancePercentage.toFixed(1)}%
          </p>
        ))}
      </div>

    </div>
  );
}