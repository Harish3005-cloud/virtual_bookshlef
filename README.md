# Book Tracker - Virtual Bookshelf Application

A modern, full-stack web application for tracking and managing your personal book collection. Built with Next.js 16, TypeScript, MySQL, and NextAuth.js.

## Features

### 📚 **Core Functionality**
- **Book Catalog**: Browse and search through books by title, ISBN, or description
- **Custom Shelves**: Create and organize multiple custom bookshelves
- **Reading Status Tracking**: Mark books as To-Read, Reading, or Read
- **Ownership Management**: Track if you Own, Ebook, Library, or Borrowed
- **Reading Progress**: Track current page for books you're reading
- **User Ratings**: Rate books from 1-5 stars
- **Favorites**: Mark books as favorites

### 🔐 **Authentication & Security**
- Secure user authentication with NextAuth.js
- Password hashing with bcrypt
- Protected routes and API endpoints
- Session management

### 🎨 **User Interface**
- Modern, responsive design with Tailwind CSS
- Intuitive navigation
- Real-time search functionality
- Interactive book cards with cover images
- Clean dashboard layout

## Tech Stack

- **Frontend**: React 19, Next.js 16, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL
- **Authentication**: NextAuth.js
- **Password Hashing**: bcrypt
- **Styling**: Tailwind CSS v4

## Database Schema

The application uses the following MySQL tables:
- `Books` - Main catalog of books
- `book_authors` - Author information for books
- `users` - User accounts
- `custom_shelves` - User-created bookshelves
- `shelf_items` - Books added to shelves with tracking data

## Getting Started

### Prerequisites

- Node.js 20+ installed
- MySQL database running
- `.env.local` configured with database credentials

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd dbms-1
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env.local` file in the root directory:
```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=virtual_bookshelf_db

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key_here
```

4. Set up your MySQL database:
Ensure your database contains the required tables:
- Books
- book_authors
- users
- custom_shelves
- shelf_items

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### First Steps

1. Register a new account at `/register`
2. Log in at `/login`
3. Browse books on the dashboard
4. Create a custom shelf
5. Add books to your shelves and track your reading progress

## Project Structure

```
dbms-1/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth configuration
│   │   ├── books/        # Book endpoints
│   │   ├── shelves/      # Shelf management endpoints
│   │   ├── shelf-items/  # Shelf item operations
│   │   └── register/     # User registration
│   ├── book/[id]/        # Book detail page
│   ├── dashboard/        # Main dashboard
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   ├── shelf/            # Shelf management pages
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page (redirects)
│   └── providers.tsx     # Session provider
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   └── db.ts             # Database connection
├── types/
│   └── index.ts          # TypeScript interfaces
└── public/               # Static assets
```

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints

### Books
- `GET /api/books?search=query` - Search books
- `GET /api/books/[id]` - Get book details

### Shelves
- `GET /api/shelves` - Get user's shelves
- `POST /api/shelves` - Create new shelf
- `GET /api/shelves/[id]/items` - Get shelf items
- `POST /api/shelves/[id]/items` - Add book to shelf

### Shelf Items
- `PUT /api/shelf-items/[id]` - Update shelf item
- `DELETE /api/shelf-items/[id]` - Remove from shelf

## Development

### Build for Production
```bash
npm run build
npm start
```

### Type Checking
The project uses TypeScript for type safety.

### Code Style
- ESLint for linting
- Prettier for formatting (if configured)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please open an issue on the GitHub repository.
