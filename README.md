# IT Knowledge Base

A searchable library of IT troubleshooting guides built with Next.js 14, Prisma, and Tailwind CSS.

## Features

### Public Features
- **Home Page**: Search bar, category list, and recently updated guides
- **Search**: Keyword search across title, summary, and step content with category filtering
- **Guide Pages**: Detailed step-by-step instructions with markdown rendering
- **Feedback Widget**: "Was this helpful?" voting system (one vote per guide per browser)

### Admin Features
- **Authentication**: Secure admin login with email/password
- **Dashboard**: View all guides with status, helpful counts, and last updated dates
- **Guide Management**: Create, edit, and delete guides with dynamic step editor
- **Category Management**: Create, rename, and delete categories
- **Draft Mode**: Save guides as drafts before publishing

## Tech Stack

- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM with SQLite (portable to PostgreSQL)
- **Authentication**: Auth.js (NextAuth) with Credentials provider
- **Validation**: Zod
- **Forms**: React Hook Form
- **Markdown**: react-markdown
- **Testing**: Playwright

## Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your settings:
   ```
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
   NEXTAUTH_URL="http://localhost:3000"
   ADMIN_EMAIL="admin@example.com"
   ADMIN_PASSWORD="admin123"
   ```

3. **Run database migrations**:
   ```bash
   npx prisma migrate dev
   ```

4. **Seed the database**:
   ```bash
   npm run seed
   ```
   This creates:
   - 1 admin user (from environment variables)
   - 3 categories (Networking, Hardware, Software)
   - 6 sample guides with 4-6 steps each

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Public Access
- Browse guides by category
- Search for guides by keyword
- Read detailed troubleshooting steps
- Submit feedback on guide helpfulness

### Admin Access
1. Navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
2. Log in with the admin credentials from your `.env` file
3. Access the dashboard to manage guides and categories

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed the database with sample data
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run test:e2e:ui` - Run Playwright tests with UI

## Database Schema

- **Category**: id, name (unique), slug
- **Guide**: id, title, slug (unique), summary, categoryId, published (bool), createdAt, updatedAt
- **Step**: id, guideId, order (int), title, body (markdown)
- **Feedback**: id, guideId, helpful (bool), createdAt
- **User**: id, email (unique), passwordHash (bcrypt), role ("ADMIN")

## Security Features

- Server-side validation on all mutations
- Middleware protection for admin routes
- Draft guides hidden from public pages and search
- Password hashing with bcrypt
- Session-based authentication

## Testing

Run end-to-end tests with Playwright:
```bash
npm run test:e2e
```

Tests cover:
- Home page loading
- Search functionality
- Guide detail pages
- Feedback widget behavior
- Admin authentication
- Route protection

## Deployment

### Environment Variables for Production
- `DATABASE_URL` - PostgreSQL connection string (recommended for production)
- `NEXTAUTH_SECRET` - Random secret key for session encryption
- `NEXTAUTH_URL` - Your production domain URL
- `ADMIN_EMAIL` - Admin user email
- `ADMIN_PASSWORD` - Admin user password

### Database Migration to PostgreSQL
1. Update `DATABASE_URL` in production environment
2. Run `npx prisma migrate deploy`
3. The schema is compatible with PostgreSQL

## License

MIT
