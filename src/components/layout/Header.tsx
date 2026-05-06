import { Bell, Search, Settings, LogOut, User as UserIcon, Command, Moon, Sun, Icon } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { User } from '../../types';
import { useState } from 'react';


interface HeaderProps {
  user: User;
  onLogout: () => void;
  onOpenCommandPalette?: () => void;
}

export function Header({ user, onLogout, onOpenCommandPalette }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300';
      case 'manager':
        return 'bg-purple-100 text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300';
      case 'trainer':
        return 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300';
      case 'student':
        return 'bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-950 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'manager':
        return 'Manager';
      case 'trainer':
        return 'Trainer';
      case 'student':
        return 'Student';
      default:
        return role;
    }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="h-16 border-b bg-card/80 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between px-6 shadow-sm">
      {/* Logo */}
   

      {/* Search with Command Palette */}
      <div className="flex-1 max-w-md">
     
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
      

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 h-auto py-2 px-3 hover:bg-accent">
              <Avatar className="w-9 h-9 ring-2 ring-border">
                <AvatarFallback className="gradient-primary text-white text-sm font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium leading-none mb-1">{user.name}</p>
                <p className="text-xs text-muted-foreground leading-none">{user.email}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs text-muted-foreground leading-none">{user.email}</p>
                <Badge className={`w-fit mt-1 ${getRoleBadgeColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}