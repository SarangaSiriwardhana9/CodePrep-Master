'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, UserCheck, UserX, Ban } from 'lucide-react';

interface UserActionsDropdownProps {
  userId: string;
  currentStatus: string;
  onStatusChange: (userId: string, status: string) => void;
}

export function UserActionsDropdown({
  userId,
  currentStatus,
  onStatusChange,
}: UserActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => onStatusChange(userId, 'active')}
          disabled={currentStatus === 'active'}
        >
          <UserCheck className="mr-2 h-4 w-4" />
          Activate
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onStatusChange(userId, 'suspended')}
          disabled={currentStatus === 'suspended'}
        >
          <UserX className="mr-2 h-4 w-4" />
          Suspend
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onStatusChange(userId, 'banned')}
          disabled={currentStatus === 'banned'}
          className="text-destructive"
        >
          <Ban className="mr-2 h-4 w-4" />
          Ban
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

