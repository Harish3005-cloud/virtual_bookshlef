'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { BookWithAuthors } from '@/types';

const DetailLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs tracking-[0.2em] text-indigo-300 uppercase mb-1">{children}</p>
);

const GlassSection = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-white/5 bg-white/5/90 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl p-6 space-y-3">
    {children}
  </div>
);

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
        <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0b0b12] to-[#09030f] text-gray-100">
            <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(99,102,241,0.5), transparent 35%), radial-gradient(circle at 80% 0%, rgba(236,72,153,0.4), transparent 25%)' }} />
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to bottom, rgba(5,5,5,0.6), transparent 40%)' }} />
            {/* Header */}
            <header className="relative bg-[#090909]/80 backdrop-blur border-b border-white/5">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center py-4">
                        <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 mr-4 transition-colors font-medium tracking-wide">
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid gap-8 lg:grid-cols-[3fr,2fr]">
                    <GlassSection>
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="md:w-1/3">
                                {book.CoverImage_URL ? (
                                    <div className="overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_45px_rgba(0,0,0,0.45)]">
                                        <img src={book.CoverImage_URL} alt={book.Title} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-full h-64 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl flex items-center justify-center border border-white/10">
                                        <div className="text-center text-gray-400">
                                            <svg className="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                            <p className="text-xs">No Cover</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-6">
                                <div>
                                    <DetailLabel>Title</DetailLabel>
                                    <h1 className="text-3xl md:text-4xl font-bold text-white">{book.Title}</h1>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {book.authors && book.authors.length > 0 && (
                                        <div>
                                            <DetailLabel>Authors</DetailLabel>
                                            <p className="text-gray-200">{book.authors.map((a: any) => a.Author_Name).join(', ')}</p>
                                        </div>
                                    )}
                                    {book.ISBN && (
                                        <div>
                                            <DetailLabel>ISBN</DetailLabel>
                                            <p className="text-gray-200">{book.ISBN}</p>
                                        </div>
                                    )}
                                    {book.Publication_Date && (
                                        <div>
                                            <DetailLabel>Published</DetailLabel>
                                            <p className="text-gray-200">{new Date(book.Publication_Date).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                    {book.Publisher && (
                                        <div>
                                            <DetailLabel>Publisher</DetailLabel>
                                            <p className="text-gray-200">{book.Publisher}</p>
                                        </div>
                                    )}
                                    {book.Pages && (
                                        <div>
                                            <DetailLabel>Pages</DetailLabel>
                                            <p className="text-gray-200">{book.Pages}</p>
                                        </div>
                                    )}
                                    {book.Language && (
                                        <div>
                                            <DetailLabel>Language</DetailLabel>
                                            <p className="text-gray-200">{book.Language}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {book.Description && (
                            <div className="pt-4 border-t border-white/5">
                                <DetailLabel>Description</DetailLabel>
                                <p className="text-gray-200 whitespace-pre-line leading-relaxed">{book.Description}</p>
                            </div>
                        )}
                    </GlassSection>

                    <div className="space-y-6">
                        <GlassSection>
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-white">Add to My Shelf</h2>
                                <div className="h-px flex-1 ml-4 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                            </div>
                            {shelves.length === 0 ? (
                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                                    <p className="text-yellow-300 text-sm">
                                        You don't have any shelves yet.{' '}
                                        <Link href="/shelf/new" className="font-medium underline hover:text-yellow-200">
                                            Create one now
                                        </Link>
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Select Shelf</label>
                                        <select
                                            value={selectedShelf}
                                            onChange={(e) => setSelectedShelf(e.target.value)}
                                            className="w-full rounded-xl bg-[#060606] border border-white/10 px-4 py-2.5 text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
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
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Reading Status</label>
                                            <select
                                                value={readingStatus}
                                                onChange={(e) => setReadingStatus(e.target.value as any)}
                                                className="w-full rounded-xl bg-[#060606] border border-white/10 px-4 py-2.5 text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                            >
                                                <option value="To-Read">To-Read</option>
                                                <option value="Reading">Reading</option>
                                                <option value="Read">Read</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Ownership Status</label>
                                            <select
                                                value={ownershipStatus}
                                                onChange={(e) => setOwnershipStatus(e.target.value)}
                                                className="w-full rounded-xl bg-[#060606] border border-white/10 px-4 py-2.5 text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
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
                                        className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold tracking-wide"
                                    >
                                        {addingToShelf ? 'Adding...' : 'Add to Shelf'}
                                    </button>
                                </div>
                            )}
                        </GlassSection>
                        <GlassSection>
                            <DetailLabel>Need more books?</DetailLabel>
                            <p className="text-gray-200">Explore the catalog or revisit your shelves to keep curating your reading universe.</p>
                            <div className="flex gap-3">
                                <Link href="/dashboard" className="flex-1 text-center rounded-xl border border-white/15 py-2.5 font-medium text-gray-100 hover:bg-white/5 transition">
                                    Browse Library
                                </Link>
                                <Link href="/shelf/new" className="flex-1 text-center rounded-xl border border-indigo-500/60 bg-indigo-500/10 py-2.5 font-medium text-indigo-200 hover:bg-indigo-500/20 transition">
                                    New Shelf
                                </Link>
                            </div>
                        </GlassSection>
                    </div>
                </div>
            </div>
        </div>
    );
}

