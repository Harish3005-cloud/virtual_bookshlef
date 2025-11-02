import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const shelves = await query(
      'SELECT * FROM custom_shelves WHERE user_id = ? ORDER BY dateCreated DESC',
      [session.user.id]
    );

    return NextResponse.json({ shelves }, { status: 200 });
  } catch (error) {
    console.error('Error fetching shelves:', error);
    return NextResponse.json({ error: 'Failed to fetch shelves' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { shelf_name, description } = body;

    if (!shelf_name) {
      return NextResponse.json({ error: 'Shelf name is required' }, { status: 400 });
    }

    const result = await query(
      'INSERT INTO custom_shelves (user_id, Shelf_name, description, dateCreated) VALUES (?, ?, ?, NOW())',
      [session.user.id, shelf_name, description || '']
    ) as any;

    return NextResponse.json({ 
      shelf: {
        Shelf_id: result.insertId,
        user_id: session.user.id,
        Shelf_name: shelf_name,
        description: description || '',
        dateCreated: new Date().toISOString()
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating shelf:', error);
    return NextResponse.json({ error: 'Failed to create shelf' }, { status: 500 });
  }
}

