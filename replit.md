# Replit.md

## Overview

This is a full-stack web application built with React (Vite) frontend and Express.js backend, featuring a modern UI component system built on shadcn/ui and Radix UI primitives. The application uses TypeScript throughout and is designed as a mobile-first application with specific dimensions (430x932px) suggesting a mobile app or PWA target. The project includes comprehensive database integration with Drizzle ORM, PostgreSQL support, and a clean separation between client, server, and shared code.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### October 7, 2025
- **Step-by-Step Onboarding Questionnaire**: Implemented a step-by-step questionnaire during farmer registration for crop preferences
  - Questions appear one at a time with progress indicator
  - Next button navigates between questions
  - Skip button appears after answering 3 questions
  - Skip shows popup notification that preferences can be completed in Settings
  - Seamless navigation to farmer dashboard after skip or completion

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with a simple Switch/Route pattern
- **State Management**: React Query (TanStack Query) for server state management and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Mobile-First Design**: Fixed dimensions (430x932px) indicating mobile app or PWA targeting

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **API Structure**: RESTful API with `/api` prefix for all backend routes
- **Development Setup**: Hot reloading with tsx for development, esbuild for production builds
- **Storage Layer**: Abstracted storage interface with in-memory implementation for development and database implementation for production

### Database Design
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema Location**: Shared schema definitions in `shared/schema.ts`
- **Migration Strategy**: Drizzle Kit for schema migrations with `db:push` command
- **Connection**: Uses Neon Database serverless PostgreSQL with connection string from environment variables

### Project Structure
- **Monorepo Layout**: Client, server, and shared code in separate directories
- **Shared Types**: Database schemas and TypeScript types shared between client and server
- **Path Aliases**: TypeScript path mapping for clean imports (`@/`, `@shared/`)
- **Asset Management**: Figma assets integration with static asset serving

### Development Environment
- **Build System**: Vite for frontend, esbuild for backend production builds
- **TypeScript**: Strict mode enabled with comprehensive type checking
- **Development Tools**: Hot reload, error overlay, and development banner integration
- **Replit Integration**: Cartographer plugin for Replit-specific development features

### Security and Session Management
- **Session Storage**: PostgreSQL-based session storage with connect-pg-simple
- **Environment Configuration**: Environment-based database configuration
- **CORS and Security**: Express middleware for request logging and error handling

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection for Neon Database
- **drizzle-orm**: Modern TypeScript ORM for database operations
- **drizzle-kit**: Database migration and schema management tooling
- **@tanstack/react-query**: Server state management and caching for React

### UI and Design System
- **@radix-ui/**: Complete suite of Radix UI primitives for accessible component foundation
- **tailwindcss**: Utility-first CSS framework for styling
- **class-variance-authority**: Utility for creating component variants
- **clsx**: Conditional CSS class names utility
- **lucide-react**: Icon library for consistent iconography

### Development and Build Tools
- **vite**: Frontend build tool and development server
- **@vitejs/plugin-react**: React plugin for Vite
- **tsx**: TypeScript execution for development server
- **esbuild**: JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Replit-specific development tooling

### Form and Validation
- **react-hook-form**: Form state management and validation
- **@hookform/resolvers**: Validation resolvers for react-hook-form
- **zod**: TypeScript-first schema validation library
- **drizzle-zod**: Integration between Drizzle ORM and Zod validation

### Additional Libraries
- **wouter**: Lightweight client-side routing
- **date-fns**: Date manipulation and formatting utilities
- **nanoid**: Unique ID generation
- **cmdk**: Command palette/search interface component
- **embla-carousel-react**: Carousel component for image galleries