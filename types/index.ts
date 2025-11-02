// 
/**Books Table */

export interface Book {
  Book_id: number;
  Title: string;
  ISBN: string;
  Description: string;
  Publication_Date: string;
  CoverImage_URL: string;
  Publisher?: string;
  Pages?: number;
  Language?: string;
}

// 
/**users Table */
export interface User {
    user_id:number;
    user_name:string;
    createdAt:string;
    email:string;
    PasswordHash:string;
}

// 
/**Custome_shelves Table */
export interface custom_shelves{
    Shelf_id:number;
    user_id:number;
    shelf_name:string;
    description:string;
    dateCreated: string; 
}

// 
/**shlef_items Table */
export interface shelf_items{
    item_id: number;
  Shelf_id: number;
  book_id: number;
  added_date: string;
  
  // Using string literals for specific allowed values
  reading_status: 'Read' | 'Reading' | 'To-Read';
  
  current_page: number | null;
  start_date: string | null;
  finish_date: string | null;
  user_rating: number | null;
  
  // Using string literals for specific allowed values
  ownership_status: 'Owned' | 'Ebook' | 'Library' | 'Borrowed' | string;
  
  // This is a 0 or 1 from the database
  is_favorite: number;

}

export interface book_authors{
    Book_Author_id: number;
    Book_id: number;
    Author_Name:string;

}

// Combined interface for book with authors
export interface BookWithAuthors extends Book {
  authors: book_authors[];
  publisher?: string;
  pages?: number;
  language?: string;
  description?: string;
  publication_date?: string;
}

// Extend the Session type to include user ID
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}