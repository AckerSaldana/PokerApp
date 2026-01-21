import { z } from 'zod';

export const createGameSchema = z.object({
  name: z.string().max(100, 'Name must be at most 100 characters').optional(),
  date: z.string().datetime('Invalid date format'),
  notes: z.string().max(500, 'Notes must be at most 500 characters').optional(),
});

export const updateGameSchema = z.object({
  name: z.string().max(100, 'Name must be at most 100 characters').optional(),
  notes: z.string().max(500, 'Notes must be at most 500 characters').optional(),
  isActive: z.boolean().optional(),
});

export const updateResultsSchema = z.object({
  participants: z.array(
    z.object({
      oderId: z.string().min(1, 'User ID is required'),
      buyIn: z.number().int().min(0, 'Buy-in must be positive'),
      cashOut: z.number().int().min(0, 'Cash-out must be positive'),
    })
  ),
});

export const joinGameSchema = z.object({
  buyIn: z.number().int().min(0, 'Buy-in must be positive').default(0),
});

export type CreateGameInput = z.infer<typeof createGameSchema>;
export type UpdateGameInput = z.infer<typeof updateGameSchema>;
export type UpdateResultsInput = z.infer<typeof updateResultsSchema>;
export type JoinGameInput = z.infer<typeof joinGameSchema>;
