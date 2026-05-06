import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { DollarSign, CheckCircle, Clock, Receipt } from 'lucide-react';

import * as feeApi from '../../api/feeApi';
import type { FeeRecord, FeeTransaction } from '../../api/feeApi';
import { UserRole } from '../../types';

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
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface FeePaymentManagementProps {
  role: UserRole;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function FeePaymentManagement({ role }: FeePaymentManagementProps) {
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [transactions, setTransactions] = useState<FeeTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const studentId = getStudentIdFromToken();

  useEffect(() => {
    if (studentId) {
      loadStudentData(studentId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadStudentData = async (id: number) => {
    try {
      const [records, txList] = await Promise.all([
        feeApi.getStudentFeeRecords(id),
        feeApi.getStudentTransactions(id),
      ]);
      setFeeRecords(records ?? []);
      setTransactions(txList ?? []);
    } catch (e) {
      console.error('Error loading student fee data', e);
    } finally {
      setLoading(false);
    }
  };

  // Aggregate totals across all courses
  const totalFee = feeRecords.reduce((s, r) => s + r.totalFeeAtEnrollment, 0);
  const totalPaid = feeRecords.reduce((s, r) => s + r.amountPaid, 0);
  const totalPending = feeRecords.reduce((s, r) => s + r.pendingAmount, 0);
  const paidPct = totalFee > 0 ? Math.round((totalPaid / totalFee) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        Loading fee information…
      </div>
    );
  }

  if (!studentId) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        Unable to identify your account. Please log in again.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      <h1 className="text-2xl font-bold">My Fees</h1>

      {/* ── Summary Card ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fee Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <SummaryItem
              label="Total Course Fee"
              value={fmt(totalFee)}
              icon={DollarSign}
              color="text-purple-600"
            />
            <SummaryItem
              label="Total Paid"
              value={fmt(totalPaid)}
              icon={CheckCircle}
              color="text-green-600"
            />
            <SummaryItem
              label="Remaining Balance"
              value={fmt(totalPending)}
              icon={Clock}
              color={totalPending > 0 ? 'text-red-500' : 'text-green-600'}
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Payment Progress</span>
              <span>{paidPct}%</span>
            </div>
            <Progress value={paidPct} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* ── Per-Course Breakdown ──────────────────────────────────────────── */}
      {feeRecords.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Course-wise Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-right">Total Fee</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeRecords.map(r => {
                  const pct = r.totalFeeAtEnrollment > 0
                    ? Math.round((r.amountPaid / r.totalFeeAtEnrollment) * 100)
                    : 0;
                  return (
                    <TableRow key={r.feeRecordId}>
                      <TableCell className="font-medium">{r.courseName}</TableCell>
                      <TableCell className="text-right">{fmt(r.totalFeeAtEnrollment)}</TableCell>
                      <TableCell className="text-right text-green-600">{fmt(r.amountPaid)}</TableCell>
                      <TableCell className="text-right text-red-600">{fmt(r.pendingAmount)}</TableCell>
                      <TableCell className="min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <Progress value={pct} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground w-8">{pct}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ── Payment History ───────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt No</TableHead>
                <TableHead>Course</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No payment records found.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map(t => (
                  <TableRow key={t.transactionId}>
                    {/* Read-only — no action buttons for students */}
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      <Receipt className="w-3 h-3 inline mr-1" />
                      {t.receiptNo}
                    </TableCell>
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
                    <TableCell>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getStudentIdFromToken(): number | null {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Try common claim names
    return payload.studentId ?? payload.profileId ?? null;
  } catch {
    return null;
  }
}

function SummaryItem({
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
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
      <Icon className={`w-8 h-8 ${color} flex-shrink-0`} />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  );
}
