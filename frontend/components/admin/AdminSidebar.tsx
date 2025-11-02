'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  Users,
  FileText,
  Flag,
  History,
  Settings,
  ArrowLeft,
  LogOut,
  Shield,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const adminMenuItems = [
  {
    title: 'Overview',
    icon: LayoutDashboard,
    href: '/admin/dashboard',
  },
  {
    title: 'User Management',
    icon: Users,
    href: '/users',
  },
  {
    title: 'Problem Management',
    icon: FileText,
    href: '/problems',
  },
  {
    title: 'Moderation Reports',
    icon: Flag,
    href: '/reports',
  },
  {
    title: 'Action Logs',
    icon: History,
    href: '/logs',
  },
  {
    title: 'System Config',
    icon: Settings,
    href: '/config',
  },
  {
    title: 'Analytics',
    icon: Activity,
    href: '/analytics',
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <Shield className="h-6 w-6 text-primary mr-2" />
        <span className="text-lg font-bold">Admin Panel</span>
      </div>

      <div className="flex-1 overflow-auto py-4">
        <div className="px-3 space-y-1">
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    isActive && 'bg-secondary'
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>

      <Separator />

      <div className="p-4 space-y-2">
        <div className="px-2 text-sm">
          <p className="font-medium">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          <p className="text-xs text-primary mt-1">Administrator</p>
        </div>
        
        <Link href="/dashboard">
          <Button variant="outline" className="w-full justify-start" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start" 
          size="sm"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

