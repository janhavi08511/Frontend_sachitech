// 🔥 Backend Roles (Spring Boot)
export type Role = "ADMIN" | "MANAGER" | "TRAINER" | "STUDENT";

// 🔥 Frontend Roles (UI routing)
export type UserRole = 'super_admin' | 'manager' | 'trainer' | 'student';

// 🔥 Auth Response from backend
export interface AuthResponse {
  token: string;
  role: Role;
  email: string;
}
export interface User {
  id: number; // ✅ FIXED
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  status: 'active' | 'inactive';
  avatar?: string;
  createdAt?: string;
}


export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  enrolledCourses: string[];
  admissionDate: string;
  admissionStatus: 'pending' | 'approved' | 'rejected';
  profilePhoto?: string;
  documents: Document[];
  totalFees: number;
  paidFees: number;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  duration: string;
  category: string;
  fees: number;
  thumbnail?: string;
  modules: CourseModule[];
  status: 'active' | 'inactive';
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  materials: Material[];
  assignments: Assignment[];
  order: number;
}

export interface Material {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link';
  url: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  submissions: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  fileUrl: string;
  score?: number;
  feedback?: string;
  status: 'pending' | 'graded';
}

export interface Batch {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  trainerId: string;
  trainerName: string;
  startDate: string;
  endDate: string;
  schedule: ScheduleSlot[];
  students: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface ScheduleSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
}

export interface AttendanceRecord {
  id: string;
  batchId: string;
  date: string;
  records: {
    studentId: string;
    studentName: string;
    status: 'present' | 'absent' | 'late';
  }[];
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  date: string;
  method: 'cash' | 'online' | 'card' | 'upi';
  type: 'full' | 'installment';
  status: 'completed' | 'pending' | 'failed';
  transactionId?: string;
}

export interface Internship {
  id: string;
  studentId: string;
  studentName: string;
  projectTitle: string;
  company?: string;
  startDate: string;
  endDate: string;
  status: 'applied' | 'ongoing' | 'completed' | 'placed';
  mentor?: string;
  submissions: ProjectSubmission[];
}

export interface ProjectSubmission {
  id: string;
  title: string;
  description: string;
  submittedAt: string;
  fileUrl: string;
  feedback?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  recipients: string[];
  createdAt: string;
  read: boolean;
}
