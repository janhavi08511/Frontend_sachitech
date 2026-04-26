import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '../ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../ui/table';
import {
  DollarSign, Plus, TrendingUp, CreditCard, CheckCircle, AlertCircle, Receipt,
} from 'lucide-react';
import { Progress } from '../ui/progress';

import * as feeApi from '../../api/feeApi';
import type { FeeRecord, FeeTransaction, FeeStats } from '../../api/feeApi';
import { getAllStudents } from '../../api/studentApi';
import { getCourses } from '../../api/courseApi';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const fmt = (n: number | undefined | null) =>
  `₹${(n ?? 0).toLocaleString('en-IN')}`;

const txBadgeColor = (type: string) => {
  if (type === 'CASH') return 'bg-green-100 text-green-800';
  if (type === 'ONLINE') return 'bg-blue-100 text-blue-800';
  if (type === 'CHEQUE') return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-700';
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function FeeManagement() {
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [transactions, setTransactions] = useState<FeeTransaction[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState<FeeStats>({
    totalExpectedRevenue: 0,
    totalCollected: 0,
    totalPending: 0,
    thisMonthCollected: 0,
    totalTransactions: 0,
  });

  // Search / filter state
  const [searchName, setSearchName] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Payment dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({
    studentId: '',
    courseId: '',
    installmentAmount: '',
    transactionType: 'CASH' as 'CASH' | 'ONLINE' | 'CHEQUE',
    receiptNo: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });

  // Derived: selected student's current fee record
  const selectedRecord = useMemo(() => {
    if (!form.studentId || !form.courseId) return null;
    return feeRecords.find(
      r => String(r.studentId) === form.studentId && String(r.courseId) === form.courseId,
    ) ?? null;
  }, [form.studentId, form.courseId, feeRecords]);

  // Live "new pending" preview as admin types amount
  const newPending = useMemo(() => {
    if (!selectedRecord) return null;
    const amt = parseFloat(form.installmentAmount);
    if (isNaN(amt) || amt <= 0) return selectedRecord.pendingAmount;
    return Math.max(0, selectedRecord.pendingAmount - amt);
  }, [selectedRecord, form.installmentAmount]);

  // Courses available for selected student (enrolled ones)
  const studentCourses = useMemo(() => {
    if (!form.studentId) return courses;
    const studentRecords = feeRecords.filter(r => String(r.studentId) === form.studentId);
    if (studentRecords.length === 0) return courses; // fallback: show all
    return courses.filter(c => studentRecords.some(r => String(r.courseId) === String(c.id)));
  }, [form.studentId, feeRecords, courses]);

  // ── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [rec, tx, st, co, s] = await Promise.all([
        feeApi.getAllFeeRecords(),
        feeApi.getAllTransactions(),
        getAllStudents(),
        getCourses(),
        feeApi.getFeeStats(),
      ]);
      setFeeRecords(rec);
      setTransactions(tx);
      setStudents(st ?? []);
      setCourses(co ?? []);
      setStats(s);
    } catch (e) {
      console.error('Fee load error', e);
    }
  };

  const handleSearch = async () => {
    try {
      const params: { studentName?: string; from?: string; to?: string } = {};
      if (searchName.trim()) params.studentName = searchName.trim();
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;
      const tx = await feeApi.getAllTransactions(params);
      setTransactions(tx);
    } catch (e) {
      console.error('Search error', e);
    }
  };

  // ── Submit payment ────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setFormError('');
    const amt = parseFloat(form.installmentAmount);

    if (!form.studentId) return setFormError('Please select a student.');
    if (!form.courseId) return setFormError('Please select a course.');
    if (isNaN(amt) || amt <= 0) return setFormError('Enter a valid payment amount.');
    if (selectedRecord && amt > selectedRecord.pendingAmount) {
      return setFormError(`Amount exceeds pending balance of ${fmt(selectedRecord.pendingAmount)}.`);
    }

    setSubmitting(true);
    try {
      await feeApi.collectInstallment({
        studentId: Number(form.studentId),
        courseId: Number(form.courseId),
        installmentAmount: amt,
        transactionType: form.transactionType,
        receiptNo: form.receiptNo || undefined,
        paymentDate: form.paymentDate || undefined,
      });

      setDialogOpen(false);
      resetForm();
      loadAll();
    } catch (err: any) {
      setFormError(err?.response?.data?.message ?? 'Payment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      studentId: '',
      courseId: '',
      installmentAmount: '',
      transactionType: 'CASH',
      receiptNo: '',
      paymentDate: new Date().toISOString().split('T')[0],
    });
    setFormError('');
  };

  // ── High-pending alerts ───────────────────────────────────────────────────
  const highPending = feeRecords.filter(r => r.pendingAmount > 20000);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fee Management</h1>

        {/* Record Payment Dialog */}
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Record Payment
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record Installment</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Student */}
              <div className="space-y-1">
                <Label>Student</Label>
                <Select
                  value={form.studentId}
                  onValueChange={(v) => setForm({ ...form, studentId: v, courseId: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student…" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s: any) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Course — auto-filtered by student enrollment */}
              <div className="space-y-1">
                <Label>Course</Label>
                <Select
                  value={form.courseId}
                  onValueChange={(v) => setForm({ ...form, courseId: v })}
                  disabled={!form.studentId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course…" />
                  </SelectTrigger>
                  <SelectContent>
                    {studentCourses.map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Read-only fee info */}
              {selectedRecord && (
                <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted p-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Fee</p>
                    <p className="font-semibold">{fmt(selectedRecord.totalFeeAtEnrollment)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Current Pending</p>
                    <p className="font-semibold text-red-600">{fmt(selectedRecord.pendingAmount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Already Paid</p>
                    <p className="font-semibold text-green-600">{fmt(selectedRecord.amountPaid)}</p>
                  </div>
                  {newPending !== null && (
                    <div>
                      <p className="text-muted-foreground">New Pending</p>
                      <p className="font-semibold text-blue-600">{fmt(newPending)}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Amount */}
              <div className="space-y-1">
                <Label>Payment Amount (₹)</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="Enter amount…"
                  value={form.installmentAmount}
                  onChange={(e) => setForm({ ...form, installmentAmount: e.target.value })}
                />
              </div>

              {/* Transaction Type */}
              <div className="space-y-1">
                <Label>Transaction Type</Label>
                <Select
                  value={form.transactionType}
                  onValueChange={(v) => setForm({ ...form, transactionType: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="ONLINE">Online</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Receipt No */}
              <div className="space-y-1">
                <Label>Receipt No (optional)</Label>
                <Input
                  placeholder="Auto-generated if blank"
                  value={form.receiptNo}
                  onChange={(e) => setForm({ ...form, receiptNo: e.target.value })}
                />
              </div>

              {/* Payment Date */}
              <div className="space-y-1">
                <Label>Payment Date</Label>
                <Input
                  type="date"
                  value={form.paymentDate}
                  onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                />
              </div>

              {formError && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {formError}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Saving…' : 'Record Payment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Expected Revenue"
          value={fmt(stats.totalExpectedRevenue)}
          icon={TrendingUp}
          color="text-purple-600"
        />
        <StatCard
          label="Total Collected"
          value={fmt(stats.totalCollected)}
          icon={CheckCircle}
          color="text-green-600"
        />
        <StatCard
          label="Total Pending"
          value={fmt(stats.totalPending)}
          icon={AlertCircle}
          color="text-red-500"
        />
        <StatCard
          label="This Month"
          value={fmt(stats.thisMonthCollected)}
          icon={CreditCard}
          color="text-blue-600"
        />
      </div>

      {/* ── High Pending Alert ────────────────────────────────────────────── */}
      {highPending.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Students with High Pending Fees (&gt;₹20,000)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {highPending.map(r => (
              <div key={r.feeRecordId} className="flex justify-between text-sm py-1 border-b border-red-100 last:border-0">
                <span className="font-medium">{r.studentName}</span>
                <span className="text-red-600 font-semibold">{fmt(r.pendingAmount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <Tabs defaultValue="records">
        <TabsList>
          <TabsTrigger value="records">Fee Records</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
        </TabsList>

        {/* Fee Records Tab */}
        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Student Fee Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead className="text-right">Total Fee</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Pending</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Last Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No fee records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    feeRecords.map(r => {
                      const pct = r.totalFeeAtEnrollment > 0
                        ? Math.round((r.amountPaid / r.totalFeeAtEnrollment) * 100)
                        : 0;
                      return (
                        <TableRow key={r.feeRecordId}>
                          <TableCell className="font-medium">{r.studentName}</TableCell>
                          <TableCell>{r.courseName}</TableCell>
                          <TableCell className="text-right">{fmt(r.totalFeeAtEnrollment)}</TableCell>
                          <TableCell className="text-right text-green-600">{fmt(r.amountPaid)}</TableCell>
                          <TableCell className="text-right text-red-600">{fmt(r.pendingAmount)}</TableCell>
                          <TableCell className="min-w-[120px]">
                            <div className="flex items-center gap-2">
                              <Progress value={pct} className="h-2 flex-1" />
                              <span className="text-xs text-muted-foreground w-8">{pct}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {r.lastTransactionDate ?? '—'}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transaction History Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <CardTitle className="text-base">All Transactions</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Input
                    placeholder="Search by student name…"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="w-48"
                  />
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-36"
                  />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-36"
                  />
                  <Button variant="outline" size="sm" onClick={handleSearch}>
                    Search
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchName('');
                      setDateFrom('');
                      setDateTo('');
                      loadAll();
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt No</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map(t => (
                      <TableRow key={t.transactionId}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          <Receipt className="w-3 h-3 inline mr-1" />
                          {t.receiptNo}
                        </TableCell>
                        <TableCell className="font-medium">{t.studentName}</TableCell>
                        <TableCell>{t.courseName}</TableCell>
                        <TableCell className="text-right font-semibold text-green-700">
                          {fmt(t.installmentAmount)}
                        </TableCell>
                        <TableCell>{t.paymentDate}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${txBadgeColor(t.transactionType)}`}>
                            {t.transactionType}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold mt-0.5">{value}</p>
        </div>
        <Icon className={`w-8 h-8 ${color} opacity-80`} />
      </CardContent>
    </Card>
  );
}
