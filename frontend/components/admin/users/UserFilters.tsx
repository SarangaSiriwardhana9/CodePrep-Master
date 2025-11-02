'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface UserFiltersProps {
  filters: {
    status?: string;
    role?: string;
    search?: string;
  };
  onFilterChange: (key: 'status' | 'role', value: string) => void;
  onSearch: (searchTerm: string) => void;
}

export function UserFilters({ filters, onFilterChange, onSearch }: UserFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  return (
    <div className="flex gap-4 flex-wrap">
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>
      </div>
      <Button onClick={handleSearch} variant="outline">
        Search
      </Button>
      <Select
        value={filters.status || 'all'}
        onValueChange={(value) => onFilterChange('status', value === 'all' ? '' : value)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="suspended">Suspended</SelectItem>
          <SelectItem value="banned">Banned</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.role || 'all'}
        onValueChange={(value) => onFilterChange('role', value === 'all' ? '' : value)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="moderator">Moderator</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

