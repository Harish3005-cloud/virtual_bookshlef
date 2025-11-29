import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  // Check if user is admin
  if (session?.user?.email !== 'admin@gmail.com') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    // Get all non-admin users with their shelf counts
    const users = await query(
      `SELECT u.user_id, u.user_name, u.email, COUNT(s.shelf_id) as shelf_count 
       FROM users u 
       LEFT JOIN custom_shelves s ON u.user_id = s.user_id 
       WHERE u.email != 'admin@gmail.com'
       GROUP BY u.user_id, u.user_name, u.email`
    ) as any[];

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  const { userId } = await request.json();
  
  // Check if user is admin
  if (session?.user?.email !== 'admin@gmail.com') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    // First, delete any shelf items for the user's shelves
    await query(
      `DELETE si FROM shelf_items si
       JOIN custom_shelves cs ON si.shelf_id = cs.shelf_id
       WHERE cs.user_id = ?`,
      [userId]
    );

    // Then delete the shelves
    await query(
      'DELETE FROM custom_shelves WHERE user_id = ?',
      [userId]
    );

    // Finally, delete the user
    await query(
      'DELETE FROM users WHERE user_id = ?',
      [userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
