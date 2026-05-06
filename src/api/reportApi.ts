import API from './axios';

/**
 * GET /reports/summary → DashboardSummaryDTO
 * { totalStudents, totalRevenue, totalPending, totalExpected,
 *   totalCourses, totalPlacements, ongoingInternships,
 *   thisMonthRevenue, totalPayments }
 */
export const getReportSummary = async () => {
  const res = await API.get('/reports/summary');
  return res.data;
};

/**
 * GET /reports/student → StudentReportDTO[]
 * Each item: { month, enrolled, active }
 */
export const getStudentReport = async () => {
  const res = await API.get('/reports/student');
  return Array.isArray(res.data) ? res.data : [];
};

/**
 * GET /reports/revenue → RevenueReportDTO[]
 * Each item: { month, collected, pending }
 */
export const getRevenueReport = async () => {
  const res = await API.get('/reports/revenue');
  return Array.isArray(res.data) ? res.data : [];
};

/**
 * GET /reports/course → CourseReportDTO[]
 * Each item: { courseId, courseName, courseFee, enrolled,
 *              expectedRevenue, collectedRevenue, pendingRevenue }
 */
export const getCourseReport = async () => {
  const res = await API.get('/reports/course');
  return Array.isArray(res.data) ? res.data : [];
};

/**
 * GET /reports/profit-loss → ProfitLossReportDTO
 * { totalStudentFeesCollected, totalTrainerPayments, profitLoss,
 *   profitMargin, totalStudents, totalTrainers, totalTransactions }
 */
export const getProfitLossReport = async () => {
  const res = await API.get('/reports/profit-loss');
  return res.data;
};

/**
 * GET /api/reports/download/{month}/{year}?format=pdf|excel
 * Triggers a browser file download.
 */
export const downloadMonthlyReport = async (
  month: number,
  year: number,
  format: 'pdf' | 'excel' = 'pdf'
): Promise<void> => {
  const res = await API.get(`/api/reports/download/${month}/${year}`, {
    params: { format },
    responseType: 'blob',
  });

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
  const ext = format === 'excel' ? 'xlsx' : 'pdf';
  const filename = `Monthly_Report_${monthName}_${year}.${ext}`;

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
