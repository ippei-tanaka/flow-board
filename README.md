# Flow Board

A collaborative kanban board application designed to demonstrate full-stack web development capabilities. Flow Board enables teams to organize, track, and manage tasks efficiently with real-time updates and collaborative features.

## 🎯 Project Overview

Flow Board is a production-ready task management application built with modern web technologies, showcasing expertise in:

- **Full-stack TypeScript** development
- **Server-side rendering** and **React Server Components**
- **Database design** with complex relationships
- **Authentication & Authorization** systems
- **Interactive UI** with drag-and-drop functionality
- **Testing** and type safety

## 🛠️ Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router and Server Components
- **React 19** - UI component library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Drag & Drop** - Interactive board functionality

### Backend
- **Next.js API Routes** - Serverless functions for backend logic
- **Server Actions** - Type-safe server mutations
- **Drizzle ORM** - Type-safe SQL query builder

### Database & Infrastructure
- **PostgreSQL** (Neon) - Serverless relational database
- **Neon Auth** - Authentication and user management

### Development Tools
- **Vitest** - Unit testing framework
- **ESLint** - Code linting and style consistency
- **Drizzle Kit** - Database migrations and schema management

## ✨ Features

### User Management
- 🔐 **Authentication** - Sign up and login with email


### Kanban Board
- 📋 **Lists** - Organize cards into custom lists
- 🎴 **Cards** - Create and manage tasks with titles and descriptions
- 🔄 **Drag & Drop** - Seamlessly move cards between lists


### Database
- **Robust Schema** - Well-designed relational model with:
  - Boards with ownership and member management
  - Card lists with positioning
  - Cards with descriptions and list associations
  - Cascade deletion for data integrity


## 📁 Project Structure

```
flow-board/
├── app/                   # Next.js App Router
│   ├── (auth)/           # Authentication routes
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (protected)/       # Protected routes requiring auth
│   │   ├── boards/
│   │   └── boards/[id]/
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── lib/                   # Shared utilities
│   ├── auth/             # Authentication logic
│   ├── board/            # Board business logic
│   └── db/               # Database utilities
├── src/
│   └── db/
│       └── schema.ts     # Drizzle ORM schema
├── components/           # Reusable React components
├── drizzle/             # Database migrations
└── public/              # Static assets
```

## 🚢 Deployment

Flow Board is deployed on **Vercel** with the following setup:

### Git Branches & Environments
- **`main` branch** → Production environment on Vercel
- **`dev` branch** → Preview environment on Vercel

### Database Strategy
- **Production** uses the `main` database branch on Neon
- **Preview** uses a `dev` database branch on Neon

This branching strategy allows isolated testing in preview without affecting production data, while maintaining separate database schemas for each environment.
