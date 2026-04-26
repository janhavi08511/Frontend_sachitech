import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Calendar, Clock, TrendingUp, TrendingDown, DollarSign, Award, Briefcase, Activity, AlertCircle } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';

interface StudentIntelligenceViewProps {
  studentId: string;
  onClose: () => void;
}

export function StudentIntelligenceView({ studentId, onClose }: StudentIntelligenceViewProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock student data - in real app, this would be fetched
  const student = {
    id: studentId,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 98765 43210',
    enrollmentId: 'STD2024001',
    course: 'Full Stack Development',
    batch: 'FSW-2024-A',
    enrollmentDate: '2024-01-15',
    avatar: 'JD',
    overallProgress: 78,
    placementReadiness: 85,
    skills: [
      { subject: 'HTML/CSS', score: 90 },
      { subject: 'JavaScript', score: 85 },
      { subject: 'React', score: 80 },
      { subject: 'Node.js', score: 75 },
      { subject: 'Database', score: 70 },
      { subject: 'DSA', score: 65 },
    ],
    performance: {
      attendance: 92,
      assignments: 88,
      exams: 82,
      projects: 90,
    },
    attendanceTrend: [
      { month: 'Jan', rate: 95 },
      { month: 'Feb', rate: 90 },
      { month: 'Mar', rate: 92 },
      { month: 'Apr', rate: 88 },
      { month: 'May', rate: 93 },
      { month: 'Jun', rate: 92 },
    ],
    progressTrend: [
      { month: 'Jan', progress: 20 },
      { month: 'Feb', progress: 35 },
      { month: 'Mar', progress: 48 },
      { month: 'Apr', progress: 60 },
      { month: 'May', progress: 70 },
      { month: 'Jun', progress: 78 },
    ],
    financialStatus: {
      totalFee: 85000,
      paidAmount: 60000,
      pendingAmount: 25000,
      nextDueDate: '2024-07-15',
    },
    internshipStatus: {
      status: 'Active',
      company: 'Tech Solutions Inc.',
      role: 'Frontend Developer Intern',
      startDate: '2024-06-01',
      mentor: 'Sarah Williams',
    },
    recentActivity: [
      { type: 'success', text: 'Completed React Advanced Module', time: '2 hours ago' },
      { type: 'info', text: 'Submitted Assignment #12', time: '1 day ago' },
      { type: 'success', text: 'Attended Mock Interview', time: '2 days ago' },
      { type: 'warning', text: 'Missed class on Node.js Testing', time: '3 days ago' },
      { type: 'success', text: 'Scored 95% in JavaScript Quiz', time: '5 days ago' },
    ],
    batchAverage: {
      attendance: 88,
      assignments: 82,
      exams: 78,
      projects: 85,
    },
    notes: [
      { date: '2024-06-15', author: 'Sarah Williams', note: 'Excellent progress in React. Shows strong problem-solving skills.' },
      { date: '2024-06-01', author: 'Michael Brown', note: 'Started internship. Enthusiastic and quick learner.' },
      { date: '2024-05-20', author: 'Sarah Williams', note: 'Need to improve DSA skills. Recommended additional practice.' },
    ],
  };

  const getPerformanceStatus = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'bg-green-500' };
    if (score >= 60) return { label: 'Good', color: 'bg-yellow-500' };
    return { label: 'Needs Improvement', color: 'bg-red-500' };
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-7xl my-8 border">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 gradient-primary opacity-10"></div>
          <div className="relative p-8 border-b">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-semibold shadow-lg">
                  {student.avatar}
                </div>
                <div>
                  <h2 className="text-3xl font-semibold mb-1">{student.name}</h2>
                  <p className="text-muted-foreground mb-2">{student.email} • {student.phone}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{student.enrollmentId}</Badge>
                    <Badge variant="outline">{student.course}</Badge>
                    <Badge variant="outline">{student.batch}</Badge>
                  </div>
                </div>
              </div>
              <Button variant="ghost" onClick={onClose} className="text-muted-foreground hover:text-foreground">
                ✕
              </Button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Overall Progress</span>
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-semibold mb-2">{student.overallProgress}%</div>
                  <Progress value={student.overallProgress} className="h-2" />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Placement Readiness</span>
                    <Award className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-semibold mb-2">{student.placementReadiness}%</div>
                  <Progress value={student.placementReadiness} className="h-2" />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Attendance Rate</span>
                    <Calendar className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-2xl font-semibold mb-2">{student.performance.attendance}%</div>
                  <Progress value={student.performance.attendance} className="h-2" />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Fee Status</span>
                    <DollarSign className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="text-2xl font-semibold mb-2">₹{(student.financialStatus.paidAmount / 1000).toFixed(0)}k</div>
                  <Progress value={(student.financialStatus.paidAmount / student.financialStatus.totalFee) * 100} className="h-2" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b px-8">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
              <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                Overview
              </TabsTrigger>
              <TabsTrigger value="academics" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                Academics
              </TabsTrigger>
              <TabsTrigger value="financial" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                Financial
              </TabsTrigger>
              <TabsTrigger value="internship" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                Internship
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                Activity Log
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-8 max-h-[60vh] overflow-y-auto">
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Skill Radar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Skill Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={student.skills}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 12 }} />
                        <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Performance Comparison */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance vs Batch Average</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(student.performance).map(([key, value]) => {
                      const batchAvg = student.batchAverage[key as keyof typeof student.batchAverage];
                      const diff = value - batchAvg;
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium capitalize">{key}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold">{value}%</span>
                              {diff > 0 ? (
                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                  +{diff}%
                                </Badge>
                              ) : diff < 0 ? (
                                <Badge variant="secondary" className="bg-red-100 text-red-700">
                                  {diff}%
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Same</Badge>
                              )}
                            </div>
                          </div>
                          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="absolute h-full bg-purple-500 rounded-full"
                              style={{ width: `${value}%` }}
                            />
                            <div
                              className="absolute h-full border-l-2 border-blue-500"
                              style={{ left: `${batchAvg}%` }}
                            />
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-muted-foreground">Student</span>
                            <span className="text-xs text-muted-foreground">Batch Avg: {batchAvg}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Attendance Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Attendance Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={student.attendanceTrend}>
                        <defs>
                          <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="rate" stroke="#10b981" fillOpacity={1} fill="url(#colorAttendance)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Progress Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={student.progressTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="progress" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Academics Tab */}
            <TabsContent value="academics" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Academic Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {student.notes.map((note, index) => (
                    <div key={index} className="border-l-4 border-purple-500 pl-4 py-2 bg-muted/30 rounded-r-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-purple-600">{note.author}</span>
                        <span className="text-xs text-muted-foreground">{note.date}</span>
                      </div>
                      <p className="text-sm">{note.note}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Financial Tab */}
            <TabsContent value="financial" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Fee Payment Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Total Fee</div>
                      <div className="text-2xl font-semibold">₹{student.financialStatus.totalFee.toLocaleString()}</div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Paid Amount</div>
                      <div className="text-2xl font-semibold text-green-600">₹{student.financialStatus.paidAmount.toLocaleString()}</div>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Pending Amount</div>
                      <div className="text-2xl font-semibold text-orange-600">₹{student.financialStatus.pendingAmount.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Payment Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((student.financialStatus.paidAmount / student.financialStatus.totalFee) * 100)}% Completed
                      </span>
                    </div>
                    <Progress value={(student.financialStatus.paidAmount / student.financialStatus.totalFee) * 100} className="h-3" />
                  </div>

                  {student.financialStatus.pendingAmount > 0 && (
                    <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-orange-900 dark:text-orange-100">Payment Due</div>
                        <div className="text-sm text-orange-700 dark:text-orange-300">
                          Next payment of ₹{student.financialStatus.pendingAmount.toLocaleString()} is due on {student.financialStatus.nextDueDate}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Internship Tab */}
            <TabsContent value="internship" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Internship Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {student.internshipStatus.status === 'Active' ? (
                    <div className="space-y-6">
                      <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/10 rounded-xl border border-green-200 dark:border-green-800">
                        <div className="w-16 h-16 rounded-xl gradient-success flex items-center justify-center text-white">
                          <Briefcase className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                          <Badge className="mb-2 bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
                          <h3 className="text-xl font-semibold mb-1">{student.internshipStatus.role}</h3>
                          <p className="text-muted-foreground mb-4">{student.internshipStatus.company}</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-muted-foreground">Start Date</div>
                              <div className="font-medium">{student.internshipStatus.startDate}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Mentor</div>
                              <div className="font-medium">{student.internshipStatus.mentor}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Active Internship</h3>
                      <p className="text-muted-foreground">This student is not currently in an internship program.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Log Tab */}
            <TabsContent value="activity" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {student.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.type === 'success' ? 'bg-green-500' :
                          activity.type === 'warning' ? 'bg-yellow-500' :
                          activity.type === 'error' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer Actions */}
        <div className="border-t p-6 bg-muted/30 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleString()}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button className="gradient-primary text-white">
              <Activity className="w-4 h-4 mr-2" />
              Take Action
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
