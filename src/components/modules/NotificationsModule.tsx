import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Bell, Plus, Mail, MessageSquare, Send, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';

export function NotificationsModule() {
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    type: 'info' as any,
    recipients: 'all' as any,
  });

  const handleSendNotification = () => {
    console.log('Sending notification:', notificationData);
    alert('Notification sent successfully!');
    setIsComposeOpen(false);
    setNotificationData({
      title: '',
      message: '',
      type: 'info',
      recipients: 'all',
    });
  };

  const notifications = [
    { id: 1, title: 'New Assignment Posted', message: 'A new assignment has been posted for HTML & CSS module', type: 'info', date: '2024-01-23', read: false },
    { id: 2, title: 'Payment Due Reminder', message: 'Your next installment is due on 15th May', type: 'warning', date: '2024-01-22', read: false },
    { id: 3, title: 'Class Schedule Update', message: 'Tomorrow\'s React class has been rescheduled to 2:00 PM', type: 'info', date: '2024-01-21', read: true },
    { id: 4, title: 'Attendance Alert', message: 'Your attendance has dropped below 75%', type: 'warning', date: '2024-01-20', read: true },
    { id: 5, title: 'Assignment Graded', message: 'Your JavaScript quiz has been graded. Score: 88/100', type: 'success', date: '2024-01-19', read: true },
  ];

  const templates = [
    { id: 1, name: 'Assignment Reminder', category: 'Academic', uses: 45 },
    { id: 2, name: 'Fee Due Reminder', category: 'Finance', uses: 38 },
    { id: 3, name: 'Attendance Low Alert', category: 'Academic', uses: 12 },
    { id: 4, name: 'Holiday Announcement', category: 'General', uses: 8 },
    { id: 5, name: 'Exam Schedule', category: 'Academic', uses: 22 },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'success':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Success</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Warning</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Error</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Info</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Notifications & Communication</h1>
          <p className="text-muted-foreground">Send notifications, SMS, and email to students</p>
        </div>
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Compose Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Notification</DialogTitle>
              <DialogDescription>Create and send notifications to students</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Notification Title</Label>
                <Input
                  value={notificationData.title}
                  onChange={(e) => setNotificationData({ ...notificationData, title: e.target.value })}
                  placeholder="Enter notification title"
                />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={notificationData.message}
                  onChange={(e) => setNotificationData({ ...notificationData, message: e.target.value })}
                  placeholder="Enter your message..."
                  rows={6}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={notificationData.type} onValueChange={(value: any) => setNotificationData({ ...notificationData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Information</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Recipients</Label>
                  <Select value={notificationData.recipients} onValueChange={(value: any) => setNotificationData({ ...notificationData, recipients: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      <SelectItem value="batch">Specific Batch</SelectItem>
                      <SelectItem value="course">Specific Course</SelectItem>
                      <SelectItem value="individual">Individual Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3">
                <Label>Delivery Channels</Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <Checkbox defaultChecked />
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">In-app Notification</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox defaultChecked />
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox />
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">SMS</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox />
                    <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span className="text-sm">WhatsApp</span>
                  </label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsComposeOpen(false)}>Cancel</Button>
              <Button onClick={handleSendNotification}>
                <Send className="w-4 h-4 mr-2" />
                Send Notification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Bell className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-semibold">156</p>
            <p className="text-sm text-muted-foreground mt-1">Total Sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Mail className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-semibold">142</p>
            <p className="text-sm text-muted-foreground mt-1">Emails Sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-semibold">89</p>
            <p className="text-sm text-muted-foreground mt-1">SMS Sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-orange-600" />
            <p className="text-2xl font-semibold">1,234</p>
            <p className="text-sm text-muted-foreground mt-1">Recipients</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="notifications">
        <TabsList>
          <TabsTrigger value="notifications">All Notifications</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...notifications].reverse().map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg ${
                      !notification.read ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{notification.title}</p>
                            {!notification.read && (
                              <Badge variant="secondary" className="text-xs">New</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                        </div>
                      </div>
                      {getTypeBadge(notification.type)}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span>{notification.date}</span>
                      {!notification.read && (
                        <Button size="sm" variant="ghost" className="h-auto p-0 text-blue-600">
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Notification Templates</CardTitle>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...templates].reverse().map((template) => (
                  <div key={template.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{template.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Used {template.uses} times
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm">Use Template</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { title: 'Monthly Fee Reminder', scheduledFor: '2024-02-01 09:00 AM', recipients: 'All Students' },
                  { title: 'Assignment Deadline Alert', scheduledFor: '2024-01-27 06:00 PM', recipients: 'FSWD Batch 01' },
                  { title: 'Holiday Announcement', scheduledFor: '2024-02-10 10:00 AM', recipients: 'All Students' },
                ].map((scheduled, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{scheduled.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          📅 {scheduled.scheduledFor}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          👥 {scheduled.recipients}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="ghost" className="text-red-600">Cancel</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
