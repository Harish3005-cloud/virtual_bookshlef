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
      <header className="bg-[#1a1a1a] border-b border-[#2a2a2a] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 mr-4 transition-colors">
              ← Back to Dashboard 
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-100">{shelfName || 'My Shelf'}</h1>
        </div>

        {items.length === 0 ? (
          <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] shadow p-12 text-center">
            <p className="text-gray-400 mb-4">This shelf is empty.</p>
            <Link
              href="/dashboard"
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Browse books to add
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.item_id}
                className="card-hover bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] overflow-hidden"
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
                <div className="p-4">
                  <Link href={`/book/${item.book_id}`}>
                    <h3 className="font-semibold text-gray-100 mb-2 hover:text-indigo-400 line-clamp-2 transition-colors">
                      {item.Title} 
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">ISBN: {item.ISBN}</p>
                  
                    
                    <p className="text-sm text-gray-400 mb-2">Start Date: {item.start_date}</p>
                    <p className="text-sm text-gray-400 mb-2">Finish Date: {item.finish_date}</p>
                    <p className="text-sm text-gray-400 mb-2">Rating: {item.user_rating}/5</p>
                    <p className="text-sm text-gray-400 mb-2">Favorite: {item.is_favorite ? 'Yes' : 'No'}</p>
                    <p className="text-sm text-gray-400 mb-2">Added Date: {item.added_date}</p>
                    
                  </Link>

                  {item.authors && item.authors.length > 0 && (
                    <p className="text-sm text-gray-400 mb-2">
                      {item.authors.map((a: any) => a.Author_Name).join(', ')}
                    </p>
                  )}

                  {/* Reading Status Badge */}
                  <div className="mb-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.reading_status)}`}>
                      {item.reading_status}
                    </span>
                  </div>

                  {/* Item Details */}
                  {editingItem === item.item_id ? (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          Status
                        </label>
                        <select
                          value={editForm.reading_status || item.reading_status}
                          onChange={(e) => setEditForm({ ...editForm, reading_status: e.target.value as any })}
                          className="w-full text-sm rounded bg-[#0a0a0a] border border-[#2a2a2a] px-2 py-1 text-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none"
                        >
                          <option value="To-Read">To-Read</option>
                          <option value="Reading">Reading</option>
                          <option value="Read">Read </option>
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
                            className="w-full text-sm rounded bg-[#0a0a0a] border border-[#2a2a2a] px-2 py-1 text-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none"
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
                          className="w-full text-sm rounded bg-[#0a0a0a] border border-[#2a2a2a] px-2 py-1 text-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none"
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
                          className="w-full text-sm rounded bg-[#0a0a0a] border border-[#2a2a2a] px-2 py-1 text-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none"
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
                            className="w-full text-sm rounded bg-[#0a0a0a] border border-[#2a2a2a] px-2 py-1 text-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none"
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
                            className="w-full text-sm rounded bg-[#0a0a0a] border border-[#2a2a2a] px-2 py-1 text-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none"
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
                          className="flex-1 text-xs px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="flex-1 text-xs px-3 py-1 border border-[#2a2a2a] text-gray-300 rounded hover:bg-[#2a2a2a] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-400">
                        <strong>Ownership:</strong> {item.ownership_status}
                      </p>
                      {item.current_page && (
                        <p className="text-xs text-gray-400">
                          <strong>Current Page:</strong> {item.current_page}
                        </p>
                      )}
                      {item.user_rating && (
                        <p className="text-xs text-gray-400">
                          <strong>Rating:</strong> {item.user_rating}/5
                        </p>
                      )}

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="flex-1 text-xs px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.item_id)}
                          className="flex-1 text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
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
