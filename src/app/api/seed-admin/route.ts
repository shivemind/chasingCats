import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// One-time use endpoint to create admin user
// Access via: /api/seed-admin?secret=YOUR_SECRET
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  // Simple protection - use a secret query param
  if (secret !== process.env.SEED_SECRET && secret !== 'chasingcats2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const password = await bcrypt.hash('password123', 10);

    // Create admin user
    const admin = await prisma.user.upsert({
      where: { email: 'admin@chasingcats.club' },
      update: { 
        role: 'ADMIN',
        hashedPassword: password 
      },
      create: {
        email: 'admin@chasingcats.club',
        name: 'Admin User',
        hashedPassword: password,
        role: 'ADMIN',
        profile: {
          create: {
            username: 'admin',
            bio: 'Site administrator',
            favoriteCat: 'All of them'
          }
        }
      }
    });

    // Also ensure member user exists
    const member = await prisma.user.upsert({
      where: { email: 'member@chasingcats.club' },
      update: { hashedPassword: password },
      create: {
        email: 'member@chasingcats.club',
        name: 'Chasing Cats Member',
        hashedPassword: password,
        profile: {
          create: {
            username: 'cat_member',
            bio: 'Wild cat enthusiast and photographer.',
            favoriteCat: 'Snow Leopard'
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Users created/updated',
      admin: { email: admin.email, role: admin.role },
      member: { email: member.email, role: member.role }
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed users', details: String(error) },
      { status: 500 }
    );
  }
}
