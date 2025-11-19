'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface ShelfItem {
  item_id: number;
  Shelf_id: number;
  book_id: number;
  added_date: string;
  reading_status: 'Read' | 'Reading' | 'To-Read';
  current_page: number | null;
  start_date: string | null;
  finish_date: string | null;
  user_rating: number | null;
  ownership_status: string;
  is_favorite: number;
  Title: string;
  ISBN: string;
  CoverImage_URL: string;
  authors: any[];
}

export default function ShelfDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const [items, setItems] = useState<ShelfItem[]>([]);
  const [shelfName, setShelfName] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<ShelfItem>>({});

  useEffect(() => {
    if (session) {
      fetchShelfItems();
    }
  }, [session, params.id]);

  const fetchShelfItems = async () => {
    try {
      const response = await fetch(`/api/shelves/${params.id}/items`);
      const data = await response.json();
      setItems(data.items || []);
      
      // Get shelf name from first item or fetch separately
      if (data.items && data.items.length > 0) {
        // Fetch shelf details
        const shelfResponse = await fetch('/api/shelves');
        const shelfData = await shelfResponse.json();
        const shelf = shelfData.shelves?.find((s: any) => s.Shelf_id.toString() === params.id);
        if (shelf) {
          setShelfName(shelf.Shelf_name);
        }
      }
    } catch (error) {
      console.error('Error fetching shelf items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item: ShelfItem) => {
    setEditingItem(item.item_id);
    setEditForm({
      reading_status: item.reading_status,
      start_date: item.start_date,
      ownership_status: item.ownership_status,
      current_page: item.current_page,
      user_rating: item.user_rating,
      is_favorite: item.is_favorite,
    });
  };

  const handleSaveEdit = async (itemId: number) => {
    try {
      // Format dates to YYYY-MM-DD
      const formattedEditForm = {
        ...editForm,
        start_date: editForm.start_date || null,
        finish_date: editForm.finish_date || null,
        is_favorite: editForm.is_favorite || 0
      };

      const response = await fetch(`/api/shelf-items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedEditForm),
      });

      if (response.ok) {
        await fetchShelfItems();
        setEditingItem(null);
      } else {
        alert('Failed to update item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item');
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to remove this book from the shelf?')) {
      return;
    }

    try {
      const response = await fetch(`/api/shelf-items/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchShelfItems();
      } else {
        alert('Failed to remove item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to remove item');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Read':
        return 'bg-green-900/30 text-green-400 border border-green-800/50';
      case 'Reading':
        return 'bg-blue-900/30 text-blue-400 border border-blue-800/50';
      case 'To-Read':
        return 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50';
      default:
        return 'bg-gray-900/30 text-gray-400 border border-gray-800/50';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="text-xl text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] border-b border-white/5 shadow-xl shadow-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard" 
                className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
              >
                ← Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>{items.length} books</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Shelf Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">
            {shelfName || 'My Shelf'}
          </h1>
          <p className="text-gray-400">
            Manage your personal book collection and reading progress
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-gradient-to-b from-[#181818] to-[#0f0f0f] rounded-2xl border border-white/5 shadow-xl shadow-black/40 p-16 text-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-3">This shelf is empty</h3>
              <p className="text-gray-400 mb-6">Start building your collection by adding books from the dashboard</p>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 font-medium"
              >
                Browse Books
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.item_id}
                className="card-hover bg-gradient-to-b from-[#181818] to-[#0f0f0f] rounded-2xl border border-white/5 overflow-hidden group shadow-xl shadow-black/40 transition-transform duration-300 hover:-translate-y-1"
              >
                {/* Book Cover */}
                <Link href={`/book/${item.book_id}`}>
                  {item.CoverImage_URL ? (
                    <div className="relative w-full h-64 overflow-hidden bg-[#2a2a2a]">
                      <img
                        src={item.CoverImage_URL}
                        alt={item.Title}
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
                </Link>

                {/* Book Details */}
                <div className="p-5">
                  <Link href={`/book/${item.book_id}`}>
                    <h3 className="font-semibold text-gray-100 mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                      {item.Title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">ISBN: {item.ISBN}</p>
                  </Link>

                  {item.authors && item.authors.length > 0 && (
                    <p className="text-sm text-gray-400 mb-3 line-clamp-1">
                      {item.authors.map((a: any) => a.Author_Name).join(', ')}
                    </p>
                  )}

                  {/* Reading Status Badge */}
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.reading_status)}`}>
                      {item.reading_status}
                    </span>
                  </div>

                  {/* Item Details */}
                  {editingItem === item.item_id ? (
                    <div className="space-y-3 border-t border-white/5 pt-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          Status
                        </label>
                        <select
                          value={editForm.reading_status || item.reading_status}
                          onChange={(e) => setEditForm({ ...editForm, reading_status: e.target.value as any })}
                          className="w-full text-sm rounded-lg bg-[#0a0a0a] border border-white/10 px-3 py-2 text-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all"
                        >
                          <option value="To-Read">To-Read</option>
                          <option value="Reading">Reading</option>
                          <option value="Read">Read</option>
                        </select>
                      </div>

                      {editForm.reading_status === 'Reading' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            Current Page
                          </label>
                          <input
                            type="number"
                            value={editForm.current_page || ''}
                            onChange={(e) => setEditForm({ ...editForm, current_page: parseInt(e.target.value) || null })}
                            className="w-full text-sm rounded-lg bg-[#0a0a0a] border border-white/10 px-3 py-2 text-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all"
                            placeholder="Page number"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          Ownership
                        </label>
                        <select
                          value={editForm.ownership_status || item.ownership_status}
                          onChange={(e) => setEditForm({ ...editForm, ownership_status: e.target.value })}
                          className="w-full text-sm rounded-lg bg-[#0a0a0a] border border-white/10 px-3 py-2 text-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all"
                        >
                          <option value="Owned">Owned</option>
                          <option value="Ebook">Ebook</option>
                          <option value="Library">Library</option>
                          <option value="Borrowed">Borrowed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          Rating (1-5)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={editForm.user_rating || ''}
                          onChange={(e) => setEditForm({ ...editForm, user_rating: parseInt(e.target.value) || null })}
                          className="w-full text-sm rounded-lg bg-[#0a0a0a] border border-white/10 px-3 py-2 text-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all"
                          placeholder="Rating"
                        />
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            Start Date (YYYY-MM-DD)
                          </label>
                          <input
                            type="text"
                            value={editForm.start_date || ''}
                            onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                            className="w-full text-sm rounded-lg bg-[#0a0a0a] border border-white/10 px-3 py-2 text-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all"
                            placeholder="YYYY-MM-DD"
                            pattern="\d{4}-\d{2}-\d{2}"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            Finish Date (YYYY-MM-DD)
                          </label>
                          <input
                            type="text"
                            value={editForm.finish_date || ''}
                            onChange={(e) => setEditForm({ ...editForm, finish_date: e.target.value })}
                            className="w-full text-sm rounded-lg bg-[#0a0a0a] border border-white/10 px-3 py-2 text-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all"
                            placeholder="YYYY-MM-DD"
                            pattern="\d{4}-\d{2}-\d{2}"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`favorite-${item.item_id}`}
                          checked={editForm.is_favorite === 1 || item.is_favorite === 1}
                          onChange={(e) => setEditForm({ ...editForm, is_favorite: e.target.checked ? 1 : 0 })}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-600 border-gray-700 rounded bg-[#0a0a0a]"
                        />
                        <label htmlFor={`favorite-${item.item_id}`} className="text-sm font-medium text-gray-300">
                          Favorite
                        </label>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleSaveEdit(item.item_id)}
                          className="flex-1 text-xs px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="flex-1 text-xs px-3 py-2 border border-white/10 text-gray-300 rounded-lg hover:bg-white/5 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 border-t border-white/5 pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Ownership:</span>
                        <span className="text-gray-200 font-medium">{item.ownership_status}</span>
                      </div>
                      
                      {item.current_page && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Page:</span>
                          <span className="text-gray-200 font-medium">{item.current_page}</span>
                        </div>
                      )}
                      
                      {item.user_rating && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Rating:</span>
                          <div className="flex items-center">
                            <span className="text-yellow-400 font-medium mr-1">★</span>
                            <span className="text-gray-200 font-medium">{item.user_rating}/5</span>
                          </div>
                        </div>
                      )}

                      {item.is_favorite === 1 && (
                        <div className="flex items-center text-sm">
                          <span className="text-red-400 font-medium">♥ Favorite</span>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="flex-1 text-xs px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.item_id)}
                          className="flex-1 text-xs px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
