import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_name, email, password } = body;

    if (!user_name || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsers = await query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    ) as any[];

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await query(
      'INSERT INTO users (user_name, email, PasswordHash, createdAt) VALUES (?, ?, ?, NOW())',
      [user_name, email, passwordHash]
    ) as any;

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        user_id: result.insertId,
        user_name,
        email
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}

