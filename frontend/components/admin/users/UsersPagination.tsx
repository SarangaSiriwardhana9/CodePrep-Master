'use client';

import { Button } from '@/components/ui/button';

interface UsersPaginationProps {
  page: number;
  pages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export function UsersPagination({
  page,
  pages,
  isLoading,
  onPageChange,
}: UsersPaginationProps) {
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Page {page} of {pages}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1 || isLoading}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages || isLoading}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

