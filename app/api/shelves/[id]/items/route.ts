import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(
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
    const shelf = await query(
      'SELECT * FROM custom_shelves WHERE Shelf_id = ? AND user_id = ?',
      [id, session.user.id]
    ) as any[];

    if (!shelf || shelf.length === 0) {
      return NextResponse.json({ error: 'Shelf not found' }, { status: 404 });
    }

    // First get the shelf items with book info
    const items = await query(
      `SELECT si.*, b.Title, b.ISBN, b.CoverImage_URL, b.Book_id
       FROM shelf_items si
       JOIN book b ON si.book_id = b.Book_id
       WHERE si.shelf_id = ?
       ORDER BY si.added_date DESC`,
      [id]
    ) as any[];

    // Get all book IDs
    const bookIds = items.map(item => item.Book_id);
    
    // Get authors for all books
    let authorsSql = 'SELECT * FROM book_authors WHERE Book_id IN (';
    const authorParams: any[] = [];
    
    bookIds.forEach((bookId, index) => {
      authorsSql += index > 0 ? ', ?' : '?';
      authorParams.push(bookId);
    });
    authorsSql += ')';

    const authors = bookIds.length > 0 ? await query(authorsSql, authorParams) as any[] : [];

    // Group authors by book_id
    const authorsByBook: { [key: number]: any[] } = {};
    authors.forEach(author => {
      if (!authorsByBook[author.Book_id]) {
        authorsByBook[author.Book_id] = [];
      }
      authorsByBook[author.Book_id].push({ Author_Name: author.Author_Name });
    });

    // Transform items to include authors as array
    const transformedItems = items.map(item => ({
      ...item,
      authors: authorsByBook[item.Book_id] || []
    }));

    return NextResponse.json({ items: transformedItems }, { status: 200 });
  } catch (error) {
    console.error('Error fetching shelf items:', error);
    return NextResponse.json({ error: 'Failed to fetch shelf items' }, { status: 500 });
  }
}

export async function POST(
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
    const shelf = await query(
      'SELECT * FROM custom_shelves WHERE Shelf_id = ? AND user_id = ?',
      [id, session.user.id]
    ) as any[];

    if (!shelf || shelf.length === 0) {
      return NextResponse.json({ error: 'Shelf not found' }, { status: 404 });
    }

    const body = await request.json();
    const { book_id, reading_status, ownership_status, current_page } = body;

    if (!book_id) {
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO shelf_items 
       (shelf_id, book_id, added_date, reading_status, ownership_status, current_page, start_date, is_favorite)
       VALUES (?, ?, NOW(), ?, ?, ?, NULL, 0)`,
      [
        id,
        book_id,
        reading_status || 'To-Read',
        ownership_status || 'Owned',
        current_page || null
      ]
    ) as any;

    return NextResponse.json({ 
      item: {
        item_id: result.insertId,
        Shelf_id: parseInt(id),
        book_id,
        added_date: new Date().toISOString(),
        reading_status: reading_status || 'To-Read',
        ownership_status: ownership_status || 'Owned',
        current_page: current_page || null
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding item to shelf:', error);
    return NextResponse.json({ error: 'Failed to add item to shelf' }, { status: 500 });
  }
}

