'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Book, custom_shelves } from '@/types';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [shelves, setShelves] = useState<custom_shelves[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [users, setUsers] = useState<{user_id: number, user_name: string, email: string, shelf_count: number}[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const fetchUsers = async () => {
    if (session?.user?.name !== 'admin') return;
    
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

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#1a1a1a] border-b border-[#2a2a2a] shadow-lg">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Management Panel */}
        {showUserManagement && (
          <div className="mb-8 bg-[#1a1a1a] p-6 rounded-lg border border-[#2a2a2a] shadow-lg">
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
                              disabled={user.user_name === 'admin'}
                              title={user.user_name === 'admin' ? 'Cannot delete admin user' : 'Delete user'}
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

        {/* Search Bar */}
        <div className="mb-8">
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

        {/* My Shelves Section */}
        {shelves.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-100 mb-6">My Shelves</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shelves.map((shelf) => (
                <Link
                  key={shelf.Shelf_id}
                  href={`/shelf/${shelf.Shelf_id}`}
                  className="card-hover bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a] group"
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

        {/* Books Grid */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-100">Books</h2>
            <div className="flex space-x-4">
              {session?.user?.name === 'admin' && (
                <button
                  onClick={toggleUserManagement}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  {showUserManagement ? 'Hide Users' : 'View Users'}
                </button>
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
      </div>
    </div>
  );
}
