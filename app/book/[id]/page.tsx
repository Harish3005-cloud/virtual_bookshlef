'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { BookWithAuthors } from '@/types';

export default function BookDetailPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const params = useParams();
    const [book, setBook] = useState<BookWithAuthors | null>(null);
    const [shelves, setShelves] = useState<any[]>([]);
    const [selectedShelf, setSelectedShelf] = useState('');
    const [readingStatus, setReadingStatus] = useState<'Read' | 'Reading' | 'To-Read'>('To-Read');
    const [ownershipStatus, setOwnershipStatus] = useState('Owned');
  
    const [loading, setLoading] = useState(true);
    const [addingToShelf, setAddingToShelf] = useState(false);

    useEffect(() => {
        if (session) {
            fetchBook();
            fetchShelves();
        }
    }, [session, params.id]);

    const fetchBook = async () => {
        try {
            const response = await fetch(`/api/books/${params.id}`);
            const data = await response.json();
            setBook(data.book);
        } catch (error) {
            console.error('Error fetching book:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchShelves = async () => {
        try {
            const response = await fetch('/api/shelves');
            const data = await response.json();
            setShelves(data.shelves || []);
            if (data.shelves && data.shelves.length > 0) {
                setSelectedShelf(data.shelves[0].Shelf_id.toString());
            }
        } catch (error) {
            console.error('Error fetching shelves:', error);
        }
    };

    const handleAddToShelf = async () => {
        if (!selectedShelf || !book) return;

        setAddingToShelf(true);
        try {
            const response = await fetch(`/api/shelves/${selectedShelf}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    book_id: book.Book_id,
                    reading_status: readingStatus,
                    ownership_status: ownershipStatus,
                
                }),
            });

            if (response.ok) {
                alert('Book added to shelf successfully!');
                router.push(`/shelf/${selectedShelf}`);
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to add book to shelf');
            }
        } catch (error) {
            console.error('Error adding book to shelf:', error);
            alert('Failed to add book to shelf');
        } finally {
            setAddingToShelf(false);
        }
    };

    if (loading || !session) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
                <div className="text-xl text-gray-300">Loading...</div>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
                <div className="text-xl text-gray-300">Book not found</div>
            </div>
        );
    }

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

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] shadow-2xl overflow-hidden">
                    <div className="md:flex">
                        {/* Book Cover */}
                        <div className="md:w-1/3">
                            {book.CoverImage_URL ? (
                                <img
                                    src={book.CoverImage_URL}
                                    alt={book.Title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-96 md:h-full bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
                                    <div className="text-center text-gray-400">
                                        <svg className="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        <p className="text-xs">No Cover</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Book Details */}
                        <div className="md:w-2/3 p-8">
                            <h1 className="text-3xl font-bold text-gray-100 mb-4">{book.Title}</h1>

                            <div className="space-y-4 mb-6">
                                {book.authors && book.authors.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-400">Authors:</p>
                                        <p className="text-gray-100">
                                            {book.authors.map((a: any) => a.Author_Name).join(', ')}
                                        </p>
                                    </div>
                                )}

                                {book.ISBN && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-400">ISBN:</p>
                                        <p className="text-gray-100">{book.ISBN}</p>
                                    </div>
                                )}

                                {book.Publication_Date && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-400">Publication Date:</p>
                                        <p className="text-gray-100">{new Date(book.Publication_Date).toLocaleDateString()}</p>
                                    </div>
                                )}

                                {book.Publisher && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-400">Publisher:</p>
                                        <p className="text-gray-100">{book.Publisher}</p>
                                    </div>
                                )}

                                {book.Pages && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-400">Pages:</p>
                                        <p className="text-gray-100">{book.Pages}</p>
                                    </div>
                                )}

                                {book.Language && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-400">Language:</p>
                                        <p className="text-gray-100">{book.Language}</p>
                                    </div>
                                )}
                            </div>

                            {book.Description && (
                                <div className="mb-6">
                                    <p className="text-sm font-medium text-gray-400 mb-2">Description:</p>
                                    <p className="text-gray-100 whitespace-pre-line">{book.Description}</p>
                                </div>
                            )}

                            {/* Add to Shelf Section */}
                            <div className="border-t border-[#2a2a2a] pt-6">
                                <h2 className="text-lg font-semibold text-gray-100 mb-4">Add to My Shelf</h2>

                                {shelves.length === 0 ? (
                                    <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-4 mb-4">
                                        <p className="text-yellow-400 text-sm">
                                            You don't have any shelves yet.{' '}
                                            <Link href="/shelf/new" className="font-medium underline hover:text-yellow-300">
                                                Create one now
                                            </Link>
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Select Shelf
                                            </label>
                                            <select
                                                value={selectedShelf}
                                                onChange={(e) => setSelectedShelf(e.target.value)}
                                                className="w-full rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] px-4 py-2 text-white-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none"
                                            >
                                                {shelves.map((shelf) => (
                                                    <option key={shelf.Shelf_id} value={shelf.Shelf_id}>
                                                        {shelf.Shelf_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Reading Status
                                                </label>
                                                <select
                                                    value={readingStatus}
                                                    onChange={(e) => setReadingStatus(e.target.value as any)}
                                                    className="w-full rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] px-4 py-2 text-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none"
                                                >
                                                    <option value="To-Read">To-Read</option>
                                                    <option value="Reading">Reading</option>
                                                    <option value="Read">Read</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Ownership Status
                                                </label>
                                                <select
                                                    value={ownershipStatus}
                                                    onChange={(e) => setOwnershipStatus(e.target.value)}
                                                    className="w-full rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] px-4 py-2 text-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none"
                                                >
                                                    <option value="Owned">Owned</option>
                                                    <option value="Ebook">Ebook</option>
                                                    <option value="Library">Library</option>
                                                    <option value="Borrowed">Borrowed</option>
                                                </select>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleAddToShelf}
                                            disabled={addingToShelf}
                                            className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 font-medium"
                                        >
                                            {addingToShelf ? 'Adding...' : 'Add to Shelf'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

