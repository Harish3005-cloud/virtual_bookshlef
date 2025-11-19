import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all triggers from the database
    const triggers = await query(`
      SELECT 
        TRIGGER_NAME,
        EVENT_MANIPULATION,
        EVENT_OBJECT_TABLE,
        ACTION_TIMING,
        ACTION_CONDITION,
        ACTION_STATEMENT,
        CREATED
      FROM information_schema.TRIGGERS 
      WHERE TRIGGER_SCHEMA = DATABASE()
      ORDER BY TRIGGER_NAME
    `) as any[];

    return NextResponse.json({ triggers }, { status: 200 });
  } catch (error) {
    console.error('Error fetching triggers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch triggers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { triggerName, triggerSql } = await request.json();

    if (!triggerName || !triggerSql) {
      return NextResponse.json(
        { error: 'Trigger name and SQL are required' },
        { status: 400 }
      );
    }

    // Execute the trigger creation SQL
    await query(triggerSql);

    return NextResponse.json(
      { message: 'Trigger created successfully', triggerName },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating trigger:', error);
    return NextResponse.json(
      { error: 'Failed to create trigger', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { triggerName } = await request.json();

    if (!triggerName) {
      return NextResponse.json(
        { error: 'Trigger name is required' },
        { status: 400 }
      );
    }

    // Drop the trigger
    await query(`DROP TRIGGER IF EXISTS \`${triggerName}\``);

    return NextResponse.json(
      { message: 'Trigger deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting trigger:', error);
    return NextResponse.json(
      { error: 'Failed to delete trigger' },
      { status: 500 }
    );
  }
}
