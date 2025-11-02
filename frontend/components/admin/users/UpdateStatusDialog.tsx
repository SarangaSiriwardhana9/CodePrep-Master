'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UpdateStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  currentStatus: string;
  onUpdate: (userId: string, status: 'active' | 'suspended' | 'banned', reason?: string) => Promise<void>;
  isLoading: boolean;
}

export function UpdateStatusDialog({
  open,
  onOpenChange,
  userId,
  currentStatus,
  onUpdate,
  isLoading,
}: UpdateStatusDialogProps) {
  const [newStatus, setNewStatus] = useState<'active' | 'suspended' | 'banned'>(currentStatus as typeof newStatus);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) {
      setNewStatus(currentStatus as typeof newStatus);
      setReason('');
    }
  }, [open, currentStatus]);

  const handleUpdate = async () => {
    if (!userId) return;
    await onUpdate(userId, newStatus, reason || undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update User Status</DialogTitle>
          <DialogDescription>
            Change the status of this user. A reason is optional but recommended.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>New Status</Label>
            <Select value={newStatus} onValueChange={(value) => setNewStatus(value as typeof newStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="Enter reason for status change..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

