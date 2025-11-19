import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const books = await query(
      `SELECT book_id, title, Authors, TotalRatings, AverageRating
       FROM V_TOP_RATED_BOOKS
       ORDER BY AverageRating DESC, TotalRatings DESC`
    ) as any[];

    return NextResponse.json({ books }, { status: 200 });
  } catch (error) {
    console.error('Error fetching top rated books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top rated books' },
      { status: 500 }
    );
  }
}

