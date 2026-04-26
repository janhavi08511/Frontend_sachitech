import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import API from '../../api/axios';

const fmt = (v: number | undefined) => {
  if (!v) return "₹0";
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${v.toFixed(0)}`;
};

interface TrainerPayment {
  paymentId: Long;
  trainerId: Long;
  trainerName: string;
  amount: number;
  paymentMode: string;
  paymentReference: string;
  paymentDate: string;
  status: string;
  remarks?: string;
}

interface TrainerPaymentSummary {
  trainerId: Long;
  trainerName: string;
  totalPaid: number;
  completedPayments: Long;
  pendingPayments: Long;
  pendingAmount: number;
}

export function TrainerPaymentManagement() {
  const [payments, setPayments] = useState<TrainerPayment[]>([]);
  const [summaries, setSummaries] = useState<TrainerPaymentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    trainerId: '',
    amount: '',
    paymentMode: 'CASH',
    paymentDate: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/api/admin/trainer-payments/all');
      setPayments(res.data || []);
    } catch (e) {
      console.error("Load error:", e);
      setError("Failed to load trainer payments");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post('/api/admin/trainer-payments/record', {
        trainerId: parseInt(formData.trainerId),
        amount: parseFloat(formData.amount),
        paymentMode: formData.paymentMode,
        paymentDate: formData.paymentDate,
        remarks: formData.remarks,
      });

      setFormData({
        trainerId: '',
        amount: '',
        paymentMode: 'CASH',
        paymentDate: new Date().toISOString().split('T')[0],
        remarks: '',
      });
      setShowForm(false);
      loadData();
    } catch (e) {
      console.error("Submit error:", e);
      setError("Failed to record payment");
    }
  };

  const handleStatusChange = async (paymentId: Long, newStatus: string) => {
    try {
      await API.patch(`/api/admin/trainer-payments/${paymentId}/status`, {
        status: newStatus,
      });
      loadData();
    } catch (e) {
      console.error("Status update error:", e);
      setError("Failed to update payment status");
    }
  };

  if (loading) return <p className="text-center py-10">Loading...</p>;

  const totalPaid = payments
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  const completedCount = payments.filter(p => p.status === 'COMPLETED').length;
  const pendingCount = payments.filter(p => p.status === 'PENDING').length;

  const statusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Trainer Payment Management</h1>
        <div className="flex gap-2">
          <Button onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600">
            <Plus className="w-4 h-4 mr-2" /> Record Payment
          </Button>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Paid</p>
            <h2 className="text-2xl font-bold text-green-600">{fmt(totalPaid)}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Completed Payments</p>
            <h2 className="text-2xl font-bold">{completedCount}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Pending Payments</p>
            <h2 className="text-2xl font-bold text-yellow-600">{pendingCount}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Transactions</p>
            <h2 className="text-2xl font-bold">{payments.length}</h2>
          </CardContent>
        </Card>
      </div>

      {/* FORM */}
      {showForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>Record Trainer Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Trainer ID</label>
                  <input
                    type="number"
                    required
                    value={formData.trainerId}
                    onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Enter trainer ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Payment Mode</label>
                  <select
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="CASH">Cash</option>
                    <option value="ONLINE">Online</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Remarks</label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Optional remarks"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-green-600">
                  Record Payment
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-400"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* PAYMENTS TABLE */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Payments</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Trainer</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Mode</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Reference</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...payments].reverse().map((payment) => (
                      <tr key={payment.paymentId} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{payment.trainerName}</td>
                        <td className="px-4 py-3 text-sm font-semibold">{fmt(payment.amount)}</td>
                        <td className="px-4 py-3 text-sm">{payment.paymentMode}</td>
                        <td className="px-4 py-3 text-sm">{payment.paymentDate}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${statusColor(payment.status)}`}>
                            {statusIcon(payment.status)}
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{payment.paymentReference}</td>
                        <td className="px-4 py-3 text-sm">
                          {payment.status === 'PENDING' && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(payment.paymentId, 'COMPLETED')}
                              className="bg-green-600 text-white"
                            >
                              Complete
                            </Button>
                          )}
                          {payment.status === 'COMPLETED' && (
                            <span className="text-green-600 text-xs font-semibold">✓ Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Trainer</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Mode</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...payments]
                      .reverse()
                      .filter(p => p.status === 'COMPLETED')
                      .map((payment) => (
                        <tr key={payment.paymentId} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{payment.trainerName}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-600">{fmt(payment.amount)}</td>
                          <td className="px-4 py-3 text-sm">{payment.paymentMode}</td>
                          <td className="px-4 py-3 text-sm">{payment.paymentDate}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{payment.paymentReference}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Trainer</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Mode</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...payments]
                      .reverse()
                      .filter(p => p.status === 'PENDING')
                      .map((payment) => (
                        <tr key={payment.paymentId} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{payment.trainerName}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-yellow-600">{fmt(payment.amount)}</td>
                          <td className="px-4 py-3 text-sm">{payment.paymentMode}</td>
                          <td className="px-4 py-3 text-sm">{payment.paymentDate}</td>
                          <td className="px-4 py-3 text-sm">
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(payment.paymentId, 'COMPLETED')}
                              className="bg-green-600 text-white"
                            >
                              Complete
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
