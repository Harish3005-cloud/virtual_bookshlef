import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Execute the trigger creation
    await query('DROP TRIGGER IF EXISTS TRG_SET_ADDED_DATE');
    await query(`
      CREATE TRIGGER TRG_SET_ADDED_DATE
      BEFORE INSERT ON shelf_items
      FOR EACH ROW
      BEGIN
          IF NEW.added_date IS NULL THEN
              SET NEW.added_date = NOW();
          END IF;
      END;
    `);

    return NextResponse.json(
      { message: 'TRG_SET_ADDED_DATE trigger created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error setting up TRG_SET_ADDED_DATE trigger:', error);
    return NextResponse.json(
      { error: 'Failed to create trigger', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
