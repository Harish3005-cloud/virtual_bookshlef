'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Book, custom_shelves } from '@/types';

const ShelfDivider = () => (
  <div className="h-2 w-full rounded-full bg-gradient-to-r from-amber-500/50 via-transparent to-transparent shadow-[0_12px_25px_rgba(0,0,0,0.45)]" />
);

const StatPill = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex flex-col rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-gray-200 shadow-inner shadow-black/30 backdrop-blur">
    <span className="text-xs uppercase tracking-widest text-gray-400">{label}</span>
    <span className="text-2xl font-semibold text-gray-100">{value}</span>
  </div>
);

interface TopRatedBook {
  book_id: number;
  title: string;
  Authors: string;
  TotalRatings: number;
  AverageRating: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [shelves, setShelves] = useState<custom_shelves[]>([]);
  const [topRatedBooks, setTopRatedBooks] = useState<TopRatedBook[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [topRatedLoading, setTopRatedLoading] = useState(true);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [users, setUsers] = useState<{user_id: number, user_name: string, email: string, shelf_count: number}[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const fetchUsers = async () => {
    if (session?.user?.email !== 'admin@gmail.com') return;
    
    setIsLoadingUsers(true);
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        // Refresh the users list
        await fetchUsers();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('An error occurred while deleting the user');
    }
  };

  const toggleUserManagement = () => {
    if (!showUserManagement) {
      fetchUsers();
    }
    setShowUserManagement(!showUserManagement);
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchBooks();
      fetchShelves();
      fetchTopRatedBooks();
    }
  }, [session]);

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

  const fetchShelves = async () => {
    try {
      const response = await fetch('/api/shelves');
      const data = await response.json();
      setShelves(data.shelves || []);
    } catch (error) {
      console.error('Error fetching shelves:', error);
    }
  };

  const fetchTopRatedBooks = async () => {
    try {
      const response = await fetch('/api/books/top-rated');
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

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="text-xl text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const statData = [
    { label: 'Books in catalog', value: books.length },
    { label: 'Shelves curated', value: shelves.length },
    { label: 'Top rated titles', value: topRatedBooks.length },
  ];

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header */}
      <header className="bg-[#090909]/80 backdrop-blur border-b border-white/5 shadow-2xl shadow-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold">
                <span className="gradient-text">Book Tracker</span>
              </h1>
              <p className="text-sm text-gray-400">Welcome back, {session.user?.name || session.user?.email}</p>
            </div>
            <Link
              href="/api/auth/signout"
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-gray-100 transition-colors"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Hero panel */}
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-r from-[#1a1a1a] via-[#0c0c0c] to-[#040404] p-8 md:p-12 shadow-2xl shadow-indigo-900/40">
          <div className="absolute inset-0 opacity-35" style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.3), rgba(236,72,153,0.2))' }} />
          <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.08) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.08) 75%, transparent 75%, transparent)', backgroundSize: '120px 120px' }} />
          <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.05), transparent 40%)' }} />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url(/window.svg)', backgroundRepeat: 'no-repeat', backgroundPosition: '85% -10%', backgroundSize: '220px' }} />
          <div className="relative grid gap-8 lg:grid-cols-[2fr,1fr] items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-indigo-300/80">Welcome back</p>
              <h2 className="mt-4 text-4xl md:text-5xl font-semibold text-white">
                Curate a universe of stories, one shelf at a time.
              </h2>
              <p className="mt-4 text-lg text-gray-300 max-w-2xl">
                Track your current reads, celebrate favorites, and discover what the community loves. Your personal library
                hub has never looked this cozy.
              </p>
            </div>
            <div className="grid gap-4">
              {statData.map((stat) => (
                <StatPill key={stat.label} label={stat.label} value={stat.value} />
              ))}
            </div>
          </div>
          <div className="mt-10">
            <ShelfDivider />
          </div>
        </div>
        {/* User Management Panel */}
        {showUserManagement && (
          <div className="bg-[#111111] p-6 rounded-3xl border border-white/5 shadow-2xl shadow-black/50">
            <h2 className="text-xl font-semibold text-gray-100 mb-6">User Management</h2>
            {isLoadingUsers ? (
              <div className="text-center py-4 text-gray-400">Loading users...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#2a2a2a]">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Username</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Shelves</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a2a]">
                    {users.map((user) => (
                      <tr key={user.user_id} className="hover:bg-[#2a2a2a] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{user.user_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{user.user_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.shelf_count}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {user.shelf_count === 0 && (
                            <button
                              onClick={() => handleDeleteUser(user.user_id)}
                              className="text-red-600 hover:text-red-900"
                              disabled={user.email === 'admin@gmail.com'}
                              title={user.email === 'admin@gmail.com' ? 'Cannot delete admin user' : 'Delete user'}
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <ShelfDivider />

        {/* Search Bar */}
        <div>
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-indigo-300/70">Community Picks</p>
                <h2 className="text-3xl font-bold text-gray-100">Top Rated Books</h2>
              </div>
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
                  href={`/book/${book.book_id}`}
                    className="card-hover rounded-2xl border border-white/5 bg-gradient-to-b from-[#181818] to-[#0f0f0f] p-5 shadow-xl shadow-black/40 transition-transform duration-300 hover:-translate-y-1"
                >
                  <h3 className="font-semibold text-gray-100 mb-1 group-hover:text-indigo-400 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-2 line-clamp-2">{book.Authors}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-yellow-400 font-semibold">
                      {ratingText}
                    </span>
                    <span className="text-gray-500">
                      {book.TotalRatings} ratings
                    </span>
                  </div>
                </Link>
              );
              })}
            </div>
          </div>
        )}

        <ShelfDivider />

        {/* My Shelves Section */}
        {shelves.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-100 mb-6">My Shelves</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shelves.map((shelf) => (
                <Link
                  key={shelf.Shelf_id}
                  href={`/shelf/${shelf.Shelf_id}`}
                  className="card-hover bg-gradient-to-b from-[#161616] to-[#0c0c0c] rounded-2xl p-6 border border-white/5 group shadow-lg shadow-black/40"
                >
                  <h3 className="text-lg font-medium text-gray-100 mb-2 group-hover:text-indigo-400 transition-colors">
                    {shelf.Shelf_name}
                  </h3>
                  <p className="text-sm text-gray-400">{shelf.description || 'No description'}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <ShelfDivider />

        {/* Books Grid */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-100">Books</h2>
            <div className="flex space-x-4">
              {session?.user?.email === 'admin@gmail.com' && (
                <>
                  <button
                    onClick={toggleUserManagement}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    {showUserManagement ? 'Hide Users' : 'View Users'}
                  </button>
                  <Link
                    href="/dashboard/triggers"
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Manage Triggers
                  </Link>
                </>
              )}
              <Link
                href="/shelf/new"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-sm font-medium shadow-lg shadow-indigo-500/20"
              >
                Create New Shelf
              </Link>
            </div>
          </div>

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
                  href={`/book/${book.Book_id}`}
                  className="card-hover bg-gradient-to-b from-[#141414] to-[#080808] rounded-2xl border border-white/5 overflow-hidden group shadow-lg shadow-black/40"
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
      </div>
    </div>
  );
}
