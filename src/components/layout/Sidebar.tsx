import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp,
  DollarSign,
  BarChart3,
  UserCog,
  FolderKanban
} from 'lucide-react';
import { UserRole } from '../../types';
import { cn } from '../../lib/utils';

interface SidebarProps {
  role: UserRole;
  activeModule: string;
  onModuleChange: (module: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'manager', 'trainer', 'student'] },
  { id: 'users', label: 'User Management', icon: UserCog, roles: ['super_admin', 'manager'] },
  { id: 'students', label: 'Students', icon: Users, roles: ['super_admin'] },
  { id: 'courses', label: 'Courses & Batches', icon: FolderKanban, roles: ['super_admin'] },
  { id: 'lms', label: 'Learning (LMS)', icon: BookOpen, roles: ['super_admin', 'manager', 'trainer', 'student'] },
  { id: 'attendance', label: 'Attendance', icon: Calendar, roles: ['super_admin', 'manager', 'trainer', 'student'] },
  { id: 'performance', label: 'Performance', icon: TrendingUp, roles: ['super_admin', 'manager', 'trainer', 'student'] },
  { id: 'fees', label: 'Fee Management', icon: DollarSign, roles: ['super_admin', 'manager', 'student'] },
  { id: 'analytics', label: 'Analytics & Reporting', icon: BarChart3, roles: ['super_admin', 'manager'] },
  
];

export function Sidebar({ role, activeModule, onModuleChange }: SidebarProps) {
  const filteredItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-white border-r h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <div className="h-16 border-b flex items-center px-4">
        <img
          src="/sachitech-logo.png"
          alt="SachITech Logo"
          className="h-10 w-auto object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onModuleChange(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
