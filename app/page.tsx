'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Book } from '@/types';

interface TopRatedBook {
  book_id: number;
  title: string;
  Authors: string;
  TotalRatings: number;
  AverageRating: number;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [topRatedBooks, setTopRatedBooks] = useState<TopRatedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [topRatedLoading, setTopRatedLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      fetchBooks();
      fetchTopRatedBooks();
    }
  }, [status]);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books');
      const data = await response.json();
      setBooks(data.books || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/books?search=${encodeURIComponent(search)}`);
      const data = await response.json();
      setBooks(data.books || []);
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopRatedBooks = async () => {
    try {
      const response = await fetch('/api/public/top-rated');
      const data = await response.json();
      if (response.ok) {
        setTopRatedBooks(data.books || []);
      }
    } catch (error) {
      console.error('Error fetching top rated books:', error);
    } finally {
      setTopRatedLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="text-xl text-gray-300">Loading...</div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Header */}
      <header className="relative overflow-hidden border-b border-[#2a2a2a] bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="gradient-text">Book Tracker</span>
          </h1>
            <p className="text-xl text-gray-300 mb-8">Discover, organize, and track your reading journey</p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/login"
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-8 py-3 border-2 border-[#2a2a2a] text-gray-200 rounded-lg hover:border-indigo-600 hover:text-indigo-400 transition-all font-medium"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <div className="mb-12">
          <div className="flex gap-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search books by title, ISBN, or description..."
              className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-6 py-3 text-gray-200 placeholder-gray-500 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none"
            />
            <button
              onClick={handleSearch}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium shadow-lg shadow-indigo-500/20"
            >
              Search
            </button>
          </div>
        </div>

        {/* Top Rated Books */}
        {!topRatedLoading && topRatedBooks.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-100">Top Rated Books</h2>
              <p className="text-sm text-gray-400">{topRatedBooks.length} titles</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {topRatedBooks.map((book) => {
                const averageRating = Number(book.AverageRating);
                const ratingText = Number.isFinite(averageRating)
                  ? `${averageRating.toFixed(2)} ★`
                  : 'No rating';

                return (
                  <Link
                    key={book.book_id}
                    href="/login"
                    className="card-hover bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-4 group"
                  >
                    <h3 className="font-semibold text-gray-100 mb-1 group-hover:text-indigo-400 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-2 line-clamp-2">{book.Authors}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-yellow-400 font-semibold">{ratingText}</span>
                      <span className="text-gray-500">{book.TotalRatings} ratings</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Books Grid */}
        <div>
          <h2 className="text-3xl font-bold text-gray-100 mb-8">Explore Our Collection</h2>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] overflow-hidden animate-pulse">
                  <div className="w-full h-64 bg-[#2a2a2a]"></div>
                  <div className="p-4">
                    <div className="h-4 bg-[#2a2a2a] rounded mb-2"></div>
                    <div className="h-4 bg-[#2a2a2a] rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-16 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
              <p className="text-gray-400 text-lg">No books found. Try a different search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book) => (
                <Link
                  key={book.Book_id}
                  href="/login"
                  className="card-hover bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] overflow-hidden group"
                >
                  {book.CoverImage_URL ? (
                    <div className="relative w-full h-64 overflow-hidden bg-[#2a2a2a]">
                      <img
                        src={book.CoverImage_URL}
                        alt={book.Title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <svg className="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p className="text-xs">No Cover</p>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-100 mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                      {book.Title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-1">ISBN: {book.ISBN}</p>
                    {book.Publication_Date && (
                      <p className="text-xs text-gray-500">
                        {new Date(book.Publication_Date).getFullYear()}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center py-16 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 rounded-xl border border-[#2a2a2a]">
          <h3 className="text-2xl font-bold text-gray-100 mb-4">Ready to start tracking?</h3>
          <p className="text-gray-400 mb-8">Create an account to organize your personal library</p>
          <Link
            href="/register"
            className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
}
