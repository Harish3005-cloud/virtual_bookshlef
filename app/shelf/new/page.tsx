'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function NewShelfPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [shelfName, setShelfName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shelfName.trim()) {
      setError('Shelf name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/shelves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shelf_name: shelfName,
          description: description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create shelf');
        setLoading(false);
        return;
      }

      // Redirect to the newly created shelf
      router.push(`/shelf/${data.shelf.Shelf_id}`);
    } catch (err) {
      console.error('Error creating shelf:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#1a1a1a] border-b border-[#2a2a2a] shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 mr-4 transition-colors">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-8">Create New Shelf</h1>

          {error && (
            <div className="mb-6 rounded-lg bg-red-900/20 border border-red-800/50 p-4 text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="shelfName" className="block text-sm font-medium text-gray-300 mb-2">
                Shelf Name *
              </label>
              <input
                id="shelfName"
                type="text"
                value={shelfName}
                onChange={(e) => setShelfName(e.target.value)}
                required
                className="w-full rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] px-4 py-3 text-gray-200 placeholder-gray-500 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none"
                placeholder="e.g., My Favorites, 2024 Reading List"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] px-4 py-3 text-gray-200 placeholder-gray-500 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none"
                placeholder="Describe what this shelf is for..."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex-1 px-4 py-3 border border-[#2a2a2a] text-gray-300 rounded-lg hover:bg-[#2a2a2a] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 font-medium"
              >
                {loading ? 'Creating...' : 'Create Shelf'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
