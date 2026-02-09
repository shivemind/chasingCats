/**
 * Gamification System - Streaks, Missions, and XP
 * 
 * This module provides utilities for the gamification features:
 * - Streak tracking and updates
 * - Mission generation and progress
 * - XP calculations and leveling
 */

import { prisma } from '@/lib/prisma';
import type { MissionType } from '@prisma/client';

// XP required for each level (exponential growth)
const XP_PER_LEVEL = [
  0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000,
  13000, 16500, 20500, 25000, 30000, 36000, 43000, 51000, 60000
];

export function calculateLevel(totalXP: number): number {
  for (let i = XP_PER_LEVEL.length - 1; i >= 0; i--) {
    if (totalXP >= XP_PER_LEVEL[i]) {
      return i + 1;
    }
  }
  return 1;
}

export function getXPForNextLevel(level: number): number {
  if (level >= XP_PER_LEVEL.length) return XP_PER_LEVEL[XP_PER_LEVEL.length - 1];
  return XP_PER_LEVEL[level];
}

// Streak management
export async function updateStreak(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  isNewDay: boolean;
  streakMaintained: boolean;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let streak = await prisma.userStreak.findUnique({
    where: { userId }
  });

  if (!streak) {
    // Create new streak record
    streak = await prisma.userStreak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today,
        totalDaysActive: 1
      }
    });
    return { 
      currentStreak: 1, 
      longestStreak: 1, 
      isNewDay: true,
      streakMaintained: true 
    };
  }

  const lastActive = streak.lastActiveDate ? new Date(streak.lastActiveDate) : null;
  lastActive?.setHours(0, 0, 0, 0);

  // Already active today
  if (lastActive && lastActive.getTime() === today.getTime()) {
    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      isNewDay: false,
      streakMaintained: true
    };
  }

  // Active yesterday - continue streak
  if (lastActive && lastActive.getTime() === yesterday.getTime()) {
    const newStreak = streak.currentStreak + 1;
    const newLongest = Math.max(newStreak, streak.longestStreak);
    
    await prisma.userStreak.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActiveDate: today,
        totalDaysActive: streak.totalDaysActive + 1
      }
    });

    return {
      currentStreak: newStreak,
      longestStreak: newLongest,
      isNewDay: true,
      streakMaintained: true
    };
  }

  // Streak broken - reset to 1
  await prisma.userStreak.update({
    where: { userId },
    data: {
      currentStreak: 1,
      lastActiveDate: today,
      totalDaysActive: streak.totalDaysActive + 1
    }
  });

  return {
    currentStreak: 1,
    longestStreak: streak.longestStreak,
    isNewDay: true,
    streakMaintained: false
  };
}

export async function getStreakData(userId: string) {
  const streak = await prisma.userStreak.findUnique({
    where: { userId }
  });

  if (!streak) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      totalDaysActive: 0,
      weekActivity: [false, false, false, false, false, false, false],
      isAtRisk: false
    };
  }

  // Calculate week activity
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekActivity: boolean[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    
    // Check if user was active on this day
    // For simplicity, we'll use the streak pattern
    if (streak.lastActiveDate) {
      const lastActive = new Date(streak.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);
      const daysSinceActive = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
      
      // If within the current streak period
      if (i <= daysSinceActive && daysSinceActive < streak.currentStreak + i) {
        weekActivity.push(true);
      } else if (i === 0 && lastActive.getTime() === today.getTime()) {
        weekActivity.push(true);
      } else {
        weekActivity.push(false);
      }
    } else {
      weekActivity.push(false);
    }
  }

  const lastActive = streak.lastActiveDate ? new Date(streak.lastActiveDate) : null;
  lastActive?.setHours(0, 0, 0, 0);
  const isActiveToday = lastActive?.getTime() === today.getTime();
  const isAtRisk = !isActiveToday && streak.currentStreak > 0;

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastActiveDate: streak.lastActiveDate?.toISOString() ?? null,
    totalDaysActive: streak.totalDaysActive,
    weekActivity,
    isAtRisk
  };
}

// Mission definitions
interface MissionTemplate {
  key: string;
  title: string;
  description: string;
  category: 'watch' | 'engage' | 'learn' | 'social' | 'challenge';
  target: number;
  xpReward: number;
  bonusReward?: string;
}

const DAILY_MISSIONS: MissionTemplate[] = [
  { key: 'watch_1', title: 'Daily Watch', description: 'Watch 1 video', category: 'watch', target: 1, xpReward: 10 },
  { key: 'watch_3', title: 'Binge Watcher', description: 'Watch 3 videos', category: 'watch', target: 3, xpReward: 25 },
  { key: 'comment_1', title: 'Join Discussion', description: 'Leave a comment', category: 'engage', target: 1, xpReward: 10 },
  { key: 'comment_3', title: 'Conversation Starter', description: 'Leave 3 comments', category: 'engage', target: 3, xpReward: 20 },
  { key: 'feed_post', title: 'Share Your Day', description: 'Post to the Pride Feed', category: 'social', target: 1, xpReward: 15 },
  { key: 'react_5', title: 'Show Some Love', description: 'React to 5 posts', category: 'social', target: 5, xpReward: 10 },
];

const WEEKLY_MISSIONS: MissionTemplate[] = [
  { key: 'watch_10', title: 'Week Warrior', description: 'Watch 10 videos this week', category: 'watch', target: 10, xpReward: 100, bonusReward: 'Exclusive Badge' },
  { key: 'complete_path', title: 'Path Progress', description: 'Complete 5 learning path items', category: 'learn', target: 5, xpReward: 150 },
  { key: 'comments_10', title: 'Community Voice', description: 'Leave 10 comments', category: 'engage', target: 10, xpReward: 75 },
  { key: 'streak_7', title: 'Week Streak', description: 'Maintain a 7-day streak', category: 'challenge', target: 7, xpReward: 200, bonusReward: 'Streak Shield' },
  { key: 'feed_posts_5', title: 'Active Member', description: 'Post 5 times to Pride Feed', category: 'social', target: 5, xpReward: 100 },
];

export async function generateDailyMissions(userId: string): Promise<void> {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Expires end of day

  // Check if daily missions already exist for today
  const existingDaily = await prisma.userMission.findFirst({
    where: {
      userId,
      missionType: 'DAILY',
      expiresAt: { gte: new Date() }
    }
  });

  if (existingDaily) return; // Already have today's missions

  // Select 3 random daily missions
  const shuffled = [...DAILY_MISSIONS].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);

  await prisma.userMission.createMany({
    data: selected.map(m => ({
      userId,
      missionType: 'DAILY' as MissionType,
      missionKey: m.key,
      target: m.target,
      xpReward: m.xpReward,
      expiresAt: today
    }))
  });
}

export async function generateWeeklyMissions(userId: string): Promise<void> {
  // Find end of week (Sunday)
  const now = new Date();
  const endOfWeek = new Date(now);
  const daysUntilSunday = 7 - now.getDay();
  endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);

  // Check if weekly missions already exist
  const existingWeekly = await prisma.userMission.findFirst({
    where: {
      userId,
      missionType: 'WEEKLY',
      expiresAt: { gte: new Date() }
    }
  });

  if (existingWeekly) return;

  // Select 3 random weekly missions
  const shuffled = [...WEEKLY_MISSIONS].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);

  await prisma.userMission.createMany({
    data: selected.map(m => ({
      userId,
      missionType: 'WEEKLY' as MissionType,
      missionKey: m.key,
      target: m.target,
      xpReward: m.xpReward,
      expiresAt: endOfWeek
    }))
  });
}

export async function getUserMissions(userId: string) {
  // Generate missions if needed
  await generateDailyMissions(userId);
  await generateWeeklyMissions(userId);

  const missions = await prisma.userMission.findMany({
    where: {
      userId,
      expiresAt: { gte: new Date() }
    },
    orderBy: { missionType: 'asc' }
  });

  // Map to frontend format
  const allTemplates = [...DAILY_MISSIONS, ...WEEKLY_MISSIONS];
  
  return missions.map(m => {
    const template = allTemplates.find(t => t.key === m.missionKey);
    return {
      id: m.id,
      title: template?.title ?? m.missionKey,
      description: template?.description ?? '',
      type: m.missionType.toLowerCase() as 'daily' | 'weekly' | 'special',
      category: template?.category ?? 'learn',
      target: m.target,
      current: m.current,
      xpReward: m.xpReward,
      bonusReward: template?.bonusReward,
      expiresAt: m.expiresAt.toISOString(),
      isCompleted: m.isCompleted,
      isClaimed: m.isClaimed
    };
  });
}

export async function updateMissionProgress(
  userId: string, 
  missionKey: string, 
  increment: number = 1
): Promise<void> {
  const missions = await prisma.userMission.findMany({
    where: {
      userId,
      missionKey,
      expiresAt: { gte: new Date() },
      isClaimed: false
    }
  });

  for (const mission of missions) {
    const newCurrent = Math.min(mission.current + increment, mission.target);
    const isCompleted = newCurrent >= mission.target;

    await prisma.userMission.update({
      where: { id: mission.id },
      data: {
        current: newCurrent,
        isCompleted
      }
    });
  }
}

export async function claimMissionReward(userId: string, missionId: string): Promise<{
  success: boolean;
  xpAwarded: number;
  newTotalXP: number;
  newLevel: number;
  error?: string;
}> {
  const mission = await prisma.userMission.findUnique({
    where: { id: missionId }
  });

  if (!mission || mission.userId !== userId) {
    return { success: false, xpAwarded: 0, newTotalXP: 0, newLevel: 0, error: 'Mission not found' };
  }

  if (!mission.isCompleted) {
    return { success: false, xpAwarded: 0, newTotalXP: 0, newLevel: 0, error: 'Mission not completed' };
  }

  if (mission.isClaimed) {
    return { success: false, xpAwarded: 0, newTotalXP: 0, newLevel: 0, error: 'Already claimed' };
  }

  // Mark as claimed
  await prisma.userMission.update({
    where: { id: missionId },
    data: { isClaimed: true }
  });

  // Award XP
  const xp = await prisma.userXP.upsert({
    where: { userId },
    create: {
      userId,
      totalXP: mission.xpReward,
      level: calculateLevel(mission.xpReward)
    },
    update: {
      totalXP: { increment: mission.xpReward }
    }
  });

  const newLevel = calculateLevel(xp.totalXP);
  
  // Update level if changed
  if (newLevel !== xp.level) {
    await prisma.userXP.update({
      where: { userId },
      data: { level: newLevel }
    });
  }

  return {
    success: true,
    xpAwarded: mission.xpReward,
    newTotalXP: xp.totalXP,
    newLevel
  };
}

export async function getUserXP(userId: string) {
  const xp = await prisma.userXP.findUnique({
    where: { userId }
  });

  if (!xp) {
    return {
      totalXP: 0,
      level: 1,
      currentLevelXP: 0,
      nextLevelXP: XP_PER_LEVEL[1],
      progress: 0
    };
  }

  const currentLevelXP = XP_PER_LEVEL[xp.level - 1] || 0;
  const nextLevelXP = getXPForNextLevel(xp.level);
  const progress = ((xp.totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return {
    totalXP: xp.totalXP,
    level: xp.level,
    currentLevelXP,
    nextLevelXP,
    progress: Math.min(progress, 100)
  };
}

// Streak rewards
export const STREAK_REWARDS = [
  { days: 3, reward: 'Bronze Paw Badge', xp: 50 },
  { days: 7, reward: 'Silver Streak Badge', xp: 100 },
  { days: 14, reward: 'Gold Streak Badge', xp: 200 },
  { days: 30, reward: 'Diamond Dedication Badge', xp: 500 },
  { days: 60, reward: 'Platinum Persistence Badge', xp: 1000 },
  { days: 90, reward: 'Legendary Learner Badge', xp: 2000 },
  { days: 365, reward: 'Year of the Cat Badge', xp: 5000 }
];
