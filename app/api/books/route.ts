import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Book } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // First, get the books with pagination
    let sql = `SELECT * FROM book`;
    const params: any[] = [];

    if (search) {
      sql += ` WHERE Title LIKE ? OR ISBN LIKE ? OR Description LIKE ?`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    sql += ` ORDER BY Title LIMIT ${limit} OFFSET ${offset}`;

    const books = await query(sql, params) as any[];

    // Then, get authors for each book
    const bookIds = books.map(book => book.Book_id);
    let authorsSql = 'SELECT * FROM book_authors WHERE Book_id IN (';
    const authorParams: any[] = [];
    
    bookIds.forEach((id, index) => {
      authorsSql += index > 0 ? ', ?' : '?';
      authorParams.push(id);
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

    // Combine books with their authors
    const transformedBooks = books.map(book => ({
      ...book,
      authors: authorsByBook[book.Book_id] || []
    }));

    return NextResponse.json({ books: transformedBooks }, { status: 200 });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}

