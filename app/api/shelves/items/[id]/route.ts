import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

// Define the RouteContext type with params as a Promise
type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params to get the ID
    const { id } = await params;
    const body = await request.json();

    // Verify the item belongs to the user
    const item = await query(
      `SELECT si.* FROM shelf_items si
       JOIN custom_shelves cs ON si.shelf_id = cs.Shelf_id
       WHERE si.item_id = ? AND cs.user_id = ?`,
      [id, session.user.id]
    ) as any[];

    if (!item || item.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Prepare the update fields
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (body.reading_status) {
      updateFields.push('reading_status = ?');
      updateValues.push(body.reading_status);
    }
    if (body.ownership_status) {
      updateFields.push('ownership_status = ?');
      updateValues.push(body.ownership_status);
    }
    if (body.current_page !== undefined) {
      updateFields.push('current_page = ?');
      updateValues.push(body.current_page);
    }
    if (body.user_rating !== undefined) {
      updateFields.push('user_rating = ?');
      updateValues.push(body.user_rating);
    }
    if (body.start_date !== undefined) {
      updateFields.push('start_date = ?');
      updateValues.push(body.start_date || null);
    }
    if (body.finish_date !== undefined) {
      updateFields.push('finish_date = ?');
      updateValues.push(body.finish_date || null);
    }
    if (body.is_favorite !== undefined) {
      updateFields.push('is_favorite = ?');
      updateValues.push(body.is_favorite ? 1 : 0);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updateValues.push(id);

    const updateQuery = `
      UPDATE shelf_items 
      SET ${updateFields.join(', ')}
      WHERE item_id = ?
    `;

    await query(updateQuery, updateValues);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating shelf item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params here too
    const { id } = await params;

    // Verify the item belongs to the user before deleting
    await query(
      `DELETE si FROM shelf_items si
       JOIN custom_shelves cs ON si.shelf_id = cs.Shelf_id
       WHERE si.item_id = ? AND cs.user_id = ?`,
      [id, session.user.id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shelf item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}