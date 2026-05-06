import { useState, useEffect } from 'react';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '../ui/command';
import { Search, Users, GraduationCap, BookOpen, Calendar, DollarSign, Settings, FileText, TrendingUp, Briefcase } from 'lucide-react';

interface CommandPaletteProps {
  onNavigate?: (module: string) => void;
}

export function CommandPalette({ onNavigate }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (module: string) => {
    setOpen(false);
    onNavigate?.(module);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search modules, students, courses..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => handleSelect('dashboard')}>
            <TrendingUp className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('users')}>
            <Users className="mr-2 h-4 w-4" />
            <span>User Management</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('students')}>
            <GraduationCap className="mr-2 h-4 w-4" />
            <span>Student Management</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('courses')}>
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Course & Batch Management</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('attendance')}>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Attendance</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('fees')}>
            <DollarSign className="mr-2 h-4 w-4" />
            <span>Fee Management</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('internship')}>
            <Briefcase className="mr-2 h-4 w-4" />
            <span>Internship & Placement</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('reports')}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Reports & Analytics</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          <CommandItem>
            <Users className="mr-2 h-4 w-4" />
            <span>Add New Student</span>
          </CommandItem>
          <CommandItem>
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Create Course</span>
          </CommandItem>
          <CommandItem>
            <FileText className="mr-2 h-4 w-4" />
            <span>Generate Report</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Settings">
          <CommandItem onSelect={() => handleSelect('settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>System Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
