import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get the book
    const book = await query(
      `SELECT * FROM book WHERE Book_id = ?`,
      [id]
    ) as any[];

    if (!book || book.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Get authors for this book
    const authors = await query(
      'SELECT * FROM book_authors WHERE Book_id = ?',
      [id]
    ) as any[];

    // Combine book with authors
    const bookData = book[0];
    bookData.authors = authors.map(author => ({ Author_Name: author.Author_Name }));

    return NextResponse.json({ book: bookData }, { status: 200 });
  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 });
  }
}

