import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify shelf belongs to user
    const item = await query(
      `SELECT si.* FROM shelf_items si
       JOIN custom_shelves cs ON si.shelf_id = cs.Shelf_id
       WHERE si.item_id = ? AND cs.user_id = ?`,
      [id, session.user.id]
    ) as any[];

    if (!item || item.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Update the item
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (body.reading_status !== undefined) {
      updateFields.push('reading_status = ?');
      updateValues.push(body.reading_status);
    }
    if (body.ownership_status !== undefined) {
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
    if (body.is_favorite !== undefined) {
      updateFields.push('is_favorite = ?');
      updateValues.push(body.is_favorite ? 1 : 0);
    }
    if (body.start_date !== undefined) {
      updateFields.push('start_date = ?');
      updateValues.push(body.start_date);
    }
    if (body.finish_date !== undefined) {
      updateFields.push('finish_date = ?');
      updateValues.push(body.finish_date);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updateValues.push(id);

    await query(
      `UPDATE shelf_items SET ${updateFields.join(', ')} WHERE item_id = ?`,
      updateValues
    );

    return NextResponse.json({ message: 'Item updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating shelf item:', error);
    return NextResponse.json({ error: 'Failed to update shelf item' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify shelf belongs to user
    const item = await query(
      `SELECT si.* FROM shelf_items si
       JOIN custom_shelves cs ON si.shelf_id = cs.Shelf_id
       WHERE si.item_id = ? AND cs.user_id = ?`,
      [id, session.user.id]
    ) as any[];

    if (!item || item.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    await query('DELETE FROM shelf_items WHERE item_id = ?', [id]);

    return NextResponse.json({ message: 'Item deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting shelf item:', error);
    return NextResponse.json({ error: 'Failed to delete shelf item' }, { status: 500 });
  }
}

