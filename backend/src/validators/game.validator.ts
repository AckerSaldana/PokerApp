import { z } from 'zod';

export const createGameSchema = z.object({
  name: z.string().max(100, 'Name must be at most 100 characters').optional(),
  notes: z.string().max(500, 'Notes must be at most 500 characters').optional(),
});

export const updateGameSchema = z.object({
  name: z.string().max(100, 'Name must be at most 100 characters').optional(),
  notes: z.string().max(500, 'Notes must be at most 500 characters').optional(),
  // isActive removed - must use closeGame() endpoint to properly settle the game
});

export const joinGameSchema = z.object({
  buyIn: z.number().int().min(0, 'Buy-in must be positive').default(0),
});

export const rebuySchema = z.object({
  amount: z.number().int().positive('Rebuy amount must be positive'),
});

export const closeGameSchema = z.object({
  results: z.array(
    z.object({
      userId: z.string().min(1, 'User ID is required'),
      cashOut: z.number().int().min(0, 'Cash-out must be positive'),
    })
  ),
});

export const earlyCashOutSchema = z.object({
  participantUserId: z.string().min(1, 'Participant user ID is required'),
  cashOut: z.number().int().min(0, 'Cash-out must be non-negative'),
});

export type CreateGameInput = z.infer<typeof createGameSchema>;
export type UpdateGameInput = z.infer<typeof updateGameSchema>;
export type JoinGameInput = z.infer<typeof joinGameSchema>;
export type RebuyInput = z.infer<typeof rebuySchema>;
export type CloseGameInput = z.infer<typeof closeGameSchema>;
export type EarlyCashOutInput = z.infer<typeof earlyCashOutSchema>;
