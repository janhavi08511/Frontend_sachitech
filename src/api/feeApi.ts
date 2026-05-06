import API from './axios';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface FeeRecord {
  feeRecordId: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  courseId: number;
  courseName: string;
  totalFeeAtEnrollment: number;
  amountPaid: number;
  pendingAmount: number;
  lastTransactionDate: string | null;
}

export interface FeeTransaction {
  transactionId: number;
  feeRecordId: number;
  studentId: number;
  studentName: string;
  courseId: number;
  courseName: string;
  installmentAmount: number;
  paymentDate: string;
  transactionType: 'CASH' | 'ONLINE' | 'CHEQUE';
  receiptNo: string;
}

export interface FeeStats {
  totalExpectedRevenue: number;
  totalCollected: number;
  totalPending: number;
  thisMonthCollected: number;
  totalTransactions: number;
}

export interface CollectInstallmentPayload {
  studentId: number;
  courseId: number;
  installmentAmount: number;
  transactionType: 'CASH' | 'ONLINE' | 'CHEQUE';
  receiptNo?: string;
  paymentDate?: string; // ISO date string
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin APIs
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/fees/collect — Admin records a new installment */
export const collectInstallment = async (payload: CollectInstallmentPayload): Promise<FeeTransaction> => {
  const res = await API.post('/api/fees/collect', payload);
  return res.data;
};

/** POST /api/fees/enroll — Admin creates a fee record on enrollment */
export const enrollStudentInCourse = async (studentId: number, courseId: number): Promise<FeeRecord> => {
  const res = await API.post('/api/fees/enroll', null, { params: { studentId, courseId } });
  return res.data;
};

/** GET /api/fees/records — All fee records (admin summary) */
export const getAllFeeRecords = async (): Promise<FeeRecord[]> => {
  const res = await API.get('/api/fees/records');
  return res.data;
};

/** GET /api/fees/transactions — All transactions, searchable */
export const getAllTransactions = async (params?: {
  studentName?: string;
  from?: string;
  to?: string;
}): Promise<FeeTransaction[]> => {
  const res = await API.get('/api/fees/transactions', { params });
  return res.data;
};

/** GET /api/fees/stats — Admin summary stats */
export const getFeeStats = async (): Promise<FeeStats> => {
  const res = await API.get('/api/fees/stats');
  return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// Student APIs (own data only — enforced server-side)
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/fees/student/{id} — Student's own fee records */
export const getStudentFeeRecords = async (studentId: number): Promise<FeeRecord[]> => {
  const res = await API.get(`/api/fees/student/${studentId}`);
  return res.data;
};

/** GET /api/fees/student/{id}/transactions — Student's own transaction history */
export const getStudentTransactions = async (studentId: number): Promise<FeeTransaction[]> => {
  const res = await API.get(`/api/fees/student/${studentId}/transactions`);
  return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// Legacy aliases (kept for backward compatibility with existing components)
// ─────────────────────────────────────────────────────────────────────────────
export const getAllPayments = getAllTransactions;
export const getStudentPayments = getStudentTransactions;
export const getStudentFeeStatus = getStudentFeeRecords;
export const recordPayment = collectInstallment;
export const getStats = getFeeStats;

export const getAllStudentFeeStatus = async () => {
  const records = await getAllFeeRecords();
  return records.map(r => {
    let feeStatus: 'paid' | 'partial' | 'pending';
    if (r.pendingAmount <= 0) {
      feeStatus = 'paid';
    } else if (r.amountPaid > 0) {
      feeStatus = 'partial';
    } else {
      feeStatus = 'pending';
    }
    return {
      studentId: r.studentId,
      studentName: r.studentName,
      totalFees: r.totalFeeAtEnrollment,
      paidAmount: r.amountPaid,
      pendingAmount: r.pendingAmount,
      feeStatus,
    };
  });
};

export const getMonthlyRevenue = async () => {
  // Returns empty array — monthly chart data not yet implemented in backend
  return [];
};

export const getFeeReportByName = async (studentName: string) => {
  return getAllTransactions({ studentName });
};
