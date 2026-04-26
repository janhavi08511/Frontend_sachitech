import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { TrendingUp, TrendingDown, DollarSign, Users, RefreshCw, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { getProfitLossReport, getRevenueReport } from '../../api/reportApi';

const fmt = (v: number | undefined) => {
  if (!v) return "₹0";
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${v.toFixed(0)}`;
};

interface ProfitLossData {
  totalStudentFeesCollected: number;
  totalTrainerPayments: number;
  profitLoss: number;
  profitMargin: number;
  totalStudents: number;
  totalTrainers: number;
  totalTransactions: number;
}

interface RevenueData {
  month: string;
  collected: number;
  pending: number;
  trainerPaid: number;
  profit: number;
}

export function RevenueReport() {
  const [profitLoss, setProfitLoss] = useState<ProfitLossData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pl, rv] = await Promise.all([
        getProfitLossReport(),
        getRevenueReport(),
      ]);

      setProfitLoss(pl);
      setRevenueData(Array.isArray(rv) ? rv : []);
    } catch (e) {
      console.error("Report load error:", e);
      setError("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center py-10">Loading...</p>;

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  // Pie chart data for profit/loss breakdown
  const profitBreakdown = profitLoss ? [
    { name: 'Student Fees', value: profitLoss.totalStudentFeesCollected, color: '#10b981' },
    { name: 'Trainer Payments', value: profitLoss.totalTrainerPayments, color: '#ef4444' },
  ] : [];

  // Determine profit/loss color
  const profitColor = profitLoss && profitLoss.profitLoss >= 0 ? 'text-green-600' : 'text-red-600';
  const profitBgColor = profitLoss && profitLoss.profitLoss >= 0 ? 'bg-green-50' : 'bg-red-50';
  const profitBorderColor = profitLoss && profitLoss.profitLoss >= 0 ? 'border-green-200' : 'border-red-200';

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Revenue & Profit/Loss Report</h1>
        <Button onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* MAIN KPI CARDS */}
      {profitLoss && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Student Fees */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Student Fees Collected</p>
                  <h2 className="text-2xl font-bold text-green-600">
                    {fmt(profitLoss.totalStudentFeesCollected)}
                  </h2>
                </div>
                <DollarSign className="w-8 h-8 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          {/* Total Trainer Payments */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Trainer Payments</p>
                  <h2 className="text-2xl font-bold text-red-600">
                    {fmt(profitLoss.totalTrainerPayments)}
                  </h2>
                </div>
                <TrendingDown className="w-8 h-8 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          {/* Profit/Loss */}
          <Card className={`border ${profitBorderColor} ${profitBgColor}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Net Profit/Loss</p>
                  <h2 className={`text-2xl font-bold ${profitColor}`}>
                    {fmt(profitLoss.profitLoss)}
                  </h2>
                </div>
                {profitLoss.profitLoss >= 0 ? (
                  <TrendingUp className={`w-8 h-8 ${profitColor} opacity-20`} />
                ) : (
                  <TrendingDown className={`w-8 h-8 ${profitColor} opacity-20`} />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profit Margin */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Profit Margin</p>
                  <h2 className={`text-2xl font-bold ${profitColor}`}>
                    {profitLoss.profitMargin.toFixed(2)}%
                  </h2>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SECONDARY METRICS */}
      {profitLoss && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Total Students</p>
              <h2 className="text-2xl font-bold">{profitLoss.totalStudents}</h2>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Total Trainers</p>
              <h2 className="text-2xl font-bold">{profitLoss.totalTrainers}</h2>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Total Transactions</p>
              <h2 className="text-2xl font-bold">{profitLoss.totalTransactions}</h2>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TABS FOR DETAILED VIEWS */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue vs Expenses */}
            {profitLoss && (
              <Card>
                <CardHeader>
                  <CardTitle>Revenue vs Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        {
                          name: 'Financial',
                          'Student Fees': profitLoss.totalStudentFeesCollected,
                          'Trainer Payments': profitLoss.totalTrainerPayments,
                        },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => fmt(value as number)} />
                      <Legend />
                      <Bar dataKey="Student Fees" fill="#10b981" />
                      <Bar dataKey="Trainer Payments" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Profit/Loss Pie Chart */}
            {profitBreakdown.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Financial Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={profitBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${fmt(value)}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {profitBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => fmt(value as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* TRENDS TAB */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue & Profit Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => fmt(value as number)} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="collected"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    name="Collected"
                  />
                  <Area
                    type="monotone"
                    dataKey="trainerPaid"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef4444"
                    name="Trainer Paid"
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    name="Profit"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Comparison */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Monthly Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => fmt(value as number)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="collected"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Collected"
                  />
                  <Line
                    type="monotone"
                    dataKey="pending"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Pending"
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Profit"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BREAKDOWN TAB */}
        <TabsContent value="breakdown">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {revenueData.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="font-medium">{item.month}</span>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Collected: {fmt(item.collected)}</p>
                        <p className="text-sm text-gray-600">Pending: {fmt(item.pending)}</p>
                        <p className={`text-sm font-semibold ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Profit: {fmt(item.profit)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Summary Statistics */}
            {profitLoss && (
              <Card>
                <CardHeader>
                  <CardTitle>Summary Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded border border-green-200">
                    <span className="font-medium">Total Revenue</span>
                    <span className="text-lg font-bold text-green-600">
                      {fmt(profitLoss.totalStudentFeesCollected)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-red-50 rounded border border-red-200">
                    <span className="font-medium">Total Expenses</span>
                    <span className="text-lg font-bold text-red-600">
                      {fmt(profitLoss.totalTrainerPayments)}
                    </span>
                  </div>

                  <div className={`flex justify-between items-center p-3 rounded border ${profitLoss.profitLoss >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <span className="font-medium">Net Profit/Loss</span>
                    <span className={`text-lg font-bold ${profitColor}`}>
                      {fmt(profitLoss.profitLoss)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded border border-blue-200">
                    <span className="font-medium">Profit Margin</span>
                    <span className="text-lg font-bold text-blue-600">
                      {profitLoss.profitMargin.toFixed(2)}%
                    </span>
                  </div>

                  <hr className="my-4" />

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Active Students</span>
                    <span className="text-lg font-bold">{profitLoss.totalStudents}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Active Trainers</span>
                    <span className="text-lg font-bold">{profitLoss.totalTrainers}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Total Transactions</span>
                    <span className="text-lg font-bold">{profitLoss.totalTransactions}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
