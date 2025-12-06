# Sammer Digital Agency App

## Overview
A React Native (Expo) mobile app for a digital agency, featuring service browsing, pricing calculator, project tracking, and contract generation.

## Project Structure

```
client/           # React Native Expo frontend
  screens/        # App screens
  components/     # Reusable components
  navigation/     # Navigation setup
  hooks/          # Custom hooks
  constants/      # Theme and constants
server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API routes
  storage.ts      # In-memory storage
shared/           # Shared types and schemas
  schema.ts       # Drizzle schema definitions
```

## Key Features

### Phase 1 (Complete)
1. **Interactive Pricing Calculator** - Service selection with complexity, speed, and add-ons
2. **Project Tracker** - Email-based project lookup with progress visualization
3. **Contract Generator** - Create, save, and share service contracts

### Upcoming Phases
- Phase 2: Admin roles, team collaboration, project lifecycle management
- Phase 3: Client accounts, loyalty program, case studies
- Phase 4: Email automation, analytics, asset library
- Phase 5: Landing page builder, audit logs, backup system

## Architecture

### Frontend
- React Native with Expo (web platform)
- React Navigation (bottom tabs + stack navigators)
- TanStack React Query for data fetching
- Reanimated for animations

### Backend
- Express server on port 5000
- In-memory storage (MemStorage class)
- RESTful API routes

### Data Models
- Services, Portfolio Projects, Inquiries, Testimonials
- Client Projects (with stage tracking)
- Clients (with loyalty points)
- Contracts (with deliverables and terms)

## Design Decisions

### Contract Generator
- Uses client email as clientId for MVP simplicity
- projectId is optional for standalone contracts
- Contracts stored with full details for sharing/export

### Project Tracker
- Email-based lookup (no auth required for MVP)
- Stage visualization with progress percentage
- Expandable cards with milestones and files

## Running the App

```bash
npm run all:dev    # Start both Expo and Express servers
```

## API Endpoints

- `GET/POST /api/services` - Services CRUD
- `GET/POST /api/portfolio` - Portfolio projects
- `GET/POST /api/inquiries` - Inquiry submissions
- `GET/POST /api/testimonials` - Client testimonials
- `GET/POST /api/client-projects` - Client project tracking
- `GET/POST /api/clients` - Client management
- `GET/POST /api/contracts` - Contract management
