import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { eventService } from '../services/event.service';

export async function getActiveEvents(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const events = await eventService.getActiveEvents();
    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
}

export async function getUpcomingEvents(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 3;
    const events = await eventService.getUpcomingEvents(limit);
    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
}

export async function getEventStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const eventId = req.params.eventId as string;
    const stats = await eventService.getEventStats(eventId);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
}

export async function getNotificationSettings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const settings = await eventService.getNotificationSettings(userId);
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
}

export async function updateNotificationSettings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const updates = req.body;
    const settings = await eventService.updateNotificationSettings(userId, updates);
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
}
