import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Briefcase, Plus, Trash2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '../ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast, Toaster } from 'sonner';
import { UserRole } from '../../types';
import { getAllInternships, createInternship } from '../../api/internshipApi';
import { getBatchesByInternship, createBatch } from '../../api/batchApi';
import { getTrainers } from '../../api/userapi';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../ui/select';

interface Props { role: UserRole; }

export function InternshipModule({ role }: Props) {
  const [internships, setInternships] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [internshipDialog, setInternshipDialog] = useState(false);
  const [batchDialog, setBatchDialog] = useState(false);

  const [internshipForm, setInternshipForm] = useState({
    name: '', duration: '', category: '', totalFee: '', status: 'ACTIVE', prerequisite: '', progress: ''
  });

  const [batchForm, setBatchForm] = useState({
    name: '', internshipId: '', trainerId: '', startDate: '', endDate: ''
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [iData, tData] = await Promise.all([
        getAllInternships().catch(() => []),
        getTrainers().catch(() => [])
      ]);
      const internshipList = Array.isArray(iData) ? iData : [];
      setInternships(internshipList);
      setTrainers(Array.isArray(tData) ? tData : []);

      // Load batches for all internships
      if (internshipList.length > 0) {
        const allBatches: any[] = [];
        for (const i of internshipList) {
          const b = await getBatchesByInternship(i.id).catch(() => []);
          allBatches.push(...(Array.isArray(b) ? b : []));
        }
        setBatches(allBatches);
      }
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInternship = async () => {
    if (!internshipForm.name.trim()) { toast.error("Name is required"); return; }
    try {
      const created = await createInternship({
        ...internshipForm,
        totalFee: parseFloat(internshipForm.totalFee || "0")
      });
      setInternships(prev => [...prev, created]);
      toast.success("Internship added");
      setInternshipDialog(false);
      setInternshipForm({ name: '', duration: '', category: '', totalFee: '', status: 'ACTIVE', prerequisite: '', progress: '' });
    } catch { toast.error("Failed to add internship"); }
  };

  const handleCreateBatch = async () => {
    if (!batchForm.internshipId || !batchForm.trainerId) {
      toast.error("Select internship and trainer"); return;
    }
    try {
      await createBatch(
        { name: batchForm.name, startDate: batchForm.startDate, endDate: batchForm.endDate },
        undefined,
        Number(batchForm.trainerId),
        Number(batchForm.internshipId)
      );
      toast.success("Batch created");
      setBatchDialog(false);
      loadData();
    } catch { toast.error("Failed to create batch"); }
  };

  const isAdmin = role === 'admin' || role === 'superadmin';

  if (loading) return <p className="text-center py-10 text-slate-400">Loading internships…</p>;

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-screen">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="text-indigo-600 w-6 h-6" /> Internship Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">Total: {internships.length} internships</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setInternshipDialog(true)}>
              <Plus className="w-4 h-4 mr-1" /> Internship
            </Button>
            <Button className="bg-indigo-600" onClick={() => setBatchDialog(true)}>
              <Plus className="w-4 h-4 mr-1" /> Batch
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Internships', value: internships.length, color: 'text-indigo-600' },
          { label: 'Active', value: internships.filter(i => i.status === 'ACTIVE').length, color: 'text-green-600' },
          { label: 'Total Batches', value: batches.length, color: 'text-blue-600' },
          { label: 'Trainers', value: trainers.length, color: 'text-purple-600' },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="internships">
        <TabsList className="mb-4">
          <TabsTrigger value="internships">Internships</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
        </TabsList>

        {/* ── INTERNSHIPS TAB ── */}
        <TabsContent value="internships">
          {internships.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed rounded-2xl text-slate-400">
              <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No internships found. Add one to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...internships].reverse().map((item: any) => (
                <Card key={item.id} className="border-none shadow-lg rounded-2xl hover:-translate-y-1 transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge className={item.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}>
                        {item.status || 'N/A'}
                      </Badge>
                      <span className="text-sm font-semibold text-indigo-600">₹{item.totalFee || 0}</span>
                    </div>
                    <CardTitle className="text-lg font-bold mt-2">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm text-slate-500">
                    {item.duration && <p>⏱ Duration: {item.duration}</p>}
                    {item.category && <p>📂 Category: {item.category}</p>}
                    {item.prerequisite && <p>📋 Prerequisite: {item.prerequisite}</p>}
                    <div className="pt-3 border-t mt-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Batches</p>
                      {batches.filter(b => b.internship?.id === item.id).length === 0
                        ? <p className="text-xs text-slate-300">No batches yet</p>
                        : batches.filter(b => b.internship?.id === item.id).map((b: any) => (
                          <div key={b.id} className="flex justify-between items-center bg-slate-50 p-1.5 rounded-lg border mb-1">
                            <span className="text-xs font-medium text-slate-700">{b.name}</span>
                            <Badge variant="outline" className="text-[9px]">{b.status || 'Scheduled'}</Badge>
                          </div>
                        ))
                      }
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── BATCHES TAB ── */}
        <TabsContent value="batches">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="pl-6">Batch Name</TableHead>
                  <TableHead>Internship</TableHead>
                  <TableHead>Trainer</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-slate-400">No batches found</TableCell>
                  </TableRow>
                ) : [...batches].reverse().map((b: any) => (
                  <TableRow key={b.id}>
                    <TableCell className="pl-6 font-medium">{b.name}</TableCell>
                    <TableCell><Badge variant="outline">{b.internship?.name || '—'}</Badge></TableCell>
                    <TableCell>{b.trainer?.name || '—'}</TableCell>
                    <TableCell>{b.startDate || '—'}</TableCell>
                    <TableCell>{b.endDate || '—'}</TableCell>
                    <TableCell>
                      <Badge className={b.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}>
                        {b.status || 'Scheduled'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── ADD INTERNSHIP DIALOG ── */}
      <Dialog open={internshipDialog} onOpenChange={setInternshipDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Internship</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Input placeholder="Name *" value={internshipForm.name} onChange={e => setInternshipForm(f => ({ ...f, name: e.target.value }))} />
            <Input placeholder="Category" value={internshipForm.category} onChange={e => setInternshipForm(f => ({ ...f, category: e.target.value }))} />
            <Input placeholder="Duration (e.g. 3 months)" value={internshipForm.duration} onChange={e => setInternshipForm(f => ({ ...f, duration: e.target.value }))} />
            <Input type="number" placeholder="Total Fee" value={internshipForm.totalFee} onChange={e => setInternshipForm(f => ({ ...f, totalFee: e.target.value }))} />
            <Input placeholder="Prerequisite" value={internshipForm.prerequisite} onChange={e => setInternshipForm(f => ({ ...f, prerequisite: e.target.value }))} />
            <select
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={internshipForm.status}
              onChange={e => setInternshipForm(f => ({ ...f, status: e.target.value }))}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInternshipDialog(false)}>Cancel</Button>
            <Button className="bg-indigo-600" onClick={handleCreateInternship}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── ADD BATCH DIALOG ── */}
      <Dialog open={batchDialog} onOpenChange={setBatchDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Internship Batch</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Input placeholder="Batch Name" value={batchForm.name} onChange={e => setBatchForm(f => ({ ...f, name: e.target.value }))} />
            <Select onValueChange={v => setBatchForm(f => ({ ...f, internshipId: v }))}>
              <SelectTrigger><SelectValue placeholder="Select Internship" /></SelectTrigger>
              <SelectContent>
                {internships.map(i => <SelectItem key={i.id} value={String(i.id)}>{i.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select onValueChange={v => setBatchForm(f => ({ ...f, trainerId: v }))}>
              <SelectTrigger><SelectValue placeholder="Select Trainer" /></SelectTrigger>
              <SelectContent>
                {trainers.map((t: any) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Input type="date" onChange={e => setBatchForm(f => ({ ...f, startDate: e.target.value }))} />
              <Input type="date" onChange={e => setBatchForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchDialog(false)}>Cancel</Button>
            <Button className="bg-indigo-600" onClick={handleCreateBatch}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
