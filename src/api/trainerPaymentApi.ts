import API from './axios';

export interface TrainerPaymentDTO {
  paymentId: number;
  trainerId: number;
  trainerName: string;
  amount: number;
  paymentMode: string;
  paymentReference: string;
  paymentDate: string;
  status: string;
  remarks?: string;
}

export interface TrainerPaymentSummaryDTO {
  trainerId: number;
  trainerName: string;
  totalPaid: number;
  completedPayments: number;
  pendingPayments: number;
  pendingAmount: number;
}

/**
 * Record a new trainer payment
 */
export const recordTrainerPayment = async (data: {
  trainerId: number;
  amount: number;
  paymentMode: string;
  paymentDate: string;
  remarks?: string;
}): Promise<TrainerPaymentDTO> => {
  const res = await API.post('/api/admin/trainer-payments/record', data);
  return res.data;
};

/**
 * Get all trainer payments
 */
export const getAllTrainerPayments = async (): Promise<TrainerPaymentDTO[]> => {
  const res = await API.get('/api/admin/trainer-payments/all');
  return Array.isArray(res.data) ? res.data : [];
};

/**
 * Get payments for a specific trainer
 */
export const getTrainerPayments = async (trainerId: number): Promise<TrainerPaymentDTO[]> => {
  const res = await API.get(`/api/admin/trainer-payments/trainer/${trainerId}`);
  return Array.isArray(res.data) ? res.data : [];
};

/**
 * Get payment summary for a trainer
 */
export const getTrainerPaymentSummary = async (trainerId: number): Promise<TrainerPaymentSummaryDTO> => {
  const res = await API.get(`/api/admin/trainer-payments/summary/${trainerId}`);
  return res.data;
};

/**
 * Update payment status
 */
export const updatePaymentStatus = async (
  paymentId: number,
  status: string
): Promise<TrainerPaymentDTO> => {
  const res = await API.patch(`/api/admin/trainer-payments/${paymentId}/status`, { status });
  return res.data;
};
