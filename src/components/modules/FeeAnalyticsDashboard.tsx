import { useEffect, useState } from "react";
import {
  getFeeStats,
  getMonthlyRevenue,
  getAllStudentFeeStatus
} from "../../api/feeApi";

import {
  Card, CardContent
} from "../ui/card";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";

export function FeeAnalyticsDashboard() {

  const [stats, setStats] = useState<any>({});
  const [monthly, setMonthly] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const [s, m, st] = await Promise.all([
      getFeeStats(),
      getMonthlyRevenue(),
      getAllStudentFeeStatus()
    ]);

    setStats(s);
    setMonthly(m);
    setStudents(st);
  };

  // 🚨 LOW PENDING ALERT
  const lowPayments = (students || []).filter(
    (s: any) => s.pendingAmount > 20000
  );

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">💰 Fee Analytics Dashboard</h1>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-4">

        <Stat title="Total Revenue" value={stats.totalCollected} />
        <Stat title="Pending Fees" value={stats.totalPending} />
        <Stat title="This Month" value={stats.thisMonth} />
        <Stat title="Transactions" value={stats.totalTransactions} />

      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-2 gap-6">

        {/* BAR */}
        <Card>
          <CardContent>
            <h2 className="font-semibold mb-2">Monthly Revenue</h2>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthly}>
                <XAxis dataKey="month"/>
                <YAxis/>
                <Tooltip/>
                <Bar dataKey="amount"/>
              </BarChart>
            </ResponsiveContainer>

          </CardContent>
        </Card>

        {/* LINE */}
        <Card>
          <CardContent>
            <h2 className="font-semibold mb-2">Revenue Trend</h2>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthly}>
                <XAxis dataKey="month"/>
                <YAxis/>
                <Tooltip/>
                <Line type="monotone" dataKey="amount"/>
              </LineChart>
            </ResponsiveContainer>

          </CardContent>
        </Card>

      </div>

      {/* ALERTS */}
      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold text-red-600">
            🚨 High Pending Fees
          </h2>

          {lowPayments.length === 0 ? (
            <p className="text-green-600">All students are on track ✅</p>
          ) : (
            lowPayments.map((s:any)=>(
              <div key={s.studentId} className="flex justify-between border-b p-2">
                <span>{s.studentName}</span>
                <span className="text-red-600">
                  ₹{s.pendingAmount}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

    </div>
  );
}

function Stat({ title, value }: any) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-bold">
          ₹{value?.toLocaleString?.() || 0}
        </p>
      </CardContent>
    </Card>
  );
}