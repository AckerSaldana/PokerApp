import { z } from 'zod';

export const createTransferSchema = z.object({
  receiverId: z.string().min(1, 'Receiver ID is required'),
  amount: z
    .number()
    .int('Amount must be a whole number')
    .min(1, 'Amount must be at least 1')
    .max(100, 'Amount cannot exceed 100 chips'),
  note: z.string().max(200, 'Note must be at most 200 characters').optional(),
});

export type CreateTransferInput = z.infer<typeof createTransferSchema>;
