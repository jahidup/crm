import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models/User';

export async function GET() {
  try {
    await connectToDatabase();
    
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@nexgenaitech.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = 'NexGen Admin';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      return NextResponse.json({
        message: 'Admin user already exists',
        email: adminEmail,
      });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const newAdmin = await User.create({
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      role: 'admin',
    });

    return NextResponse.json({
      message: 'Admin user created successfully',
      email: newAdmin.email,
      name: newAdmin.name,
      role: newAdmin.role,
    });
  } catch (error: any) {
    console.error('Admin setup error:', error);
    return NextResponse.json({ error: 'Server error during admin setup' }, { status: 500 });
  }
}
