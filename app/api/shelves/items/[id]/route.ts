import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
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

    // Add fields to update if they exist in the request body
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

    // Add the item ID to the values array
    updateValues.push(id);

    // Build and execute the update query
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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

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
