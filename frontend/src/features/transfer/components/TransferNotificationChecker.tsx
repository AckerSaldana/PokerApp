import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { transferApi } from '@/services/api/transfer';
import { useAuthStore } from '@/stores/authStore';
import { notifications } from '@/services/notifications';
import type { Transfer } from '@/lib/types';

const LAST_SEEN_KEY = 'last-seen-transfer-timestamp';

export function TransferNotificationChecker() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const lastNotifiedRef = useRef<string | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(LAST_SEEN_KEY);
    if (stored) {
      lastNotifiedRef.current = stored;
    }
  }, []);

  // Poll for recent transfers
  const { data } = useQuery({
    queryKey: ['recentTransfers'],
    queryFn: () => transferApi.getAll(1, 10),
    enabled: isAuthenticated && notifications.isSupported(),
    refetchInterval: 30000, // Check every 30 seconds
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!data?.data || !user) return;

    // Filter for received transfers
    const receivedTransfers = data.data.filter(
      (t: Transfer) => t.receiverId === user.id
    );

    if (receivedTransfers.length === 0) return;

    // Get the most recent received transfer
    const latestTransfer = receivedTransfers[0];
    const latestTimestamp = new Date(latestTransfer.createdAt).getTime().toString();

    // Check if we've already notified about this
    if (lastNotifiedRef.current && latestTimestamp <= lastNotifiedRef.current) {
      return;
    }

    // Find all new transfers since last notification
    const newTransfers = receivedTransfers.filter((t: Transfer) => {
      const timestamp = new Date(t.createdAt).getTime().toString();
      return !lastNotifiedRef.current || timestamp > lastNotifiedRef.current;
    });

    // Show notifications for new transfers
    newTransfers.forEach((transfer: Transfer) => {
      notifications.showTransferReceived(
        transfer.sender?.username || 'Someone',
        transfer.amount
      );
    });

    // Update last seen
    if (newTransfers.length > 0) {
      lastNotifiedRef.current = latestTimestamp;
      localStorage.setItem(LAST_SEEN_KEY, latestTimestamp);
    }
  }, [data, user]);

  return null;
}
