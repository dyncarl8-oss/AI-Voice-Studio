# Voice Clone Studio

## Overview

Voice Clone Studio is an AI-powered voice cloning and text-to-speech application that enables users to create personalized voice models from audio samples and generate custom speech. The application leverages Fish Audio AI for voice model training and speech synthesis, providing a professional-grade voice cloning experience through an intuitive web interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite for fast development and optimized production builds
- **Routing:** Wouter for lightweight client-side routing
- **UI Components:** Radix UI primitives with shadcn/ui component system
- **Styling:** Tailwind CSS with custom design tokens and theme system
- **State Management:** TanStack Query (React Query) for server state management
- **Form Handling:** React Hook Form with Zod schema validation

**Design System:**
- Custom color palette supporting dark/light modes with purple primary brand color
- Typography using Inter font family for UI and JetBrains Mono for technical elements
- Component library based on shadcn/ui's "new-york" style
- Consistent spacing, elevation, and animation patterns through CSS custom properties

**Key Components:**
- VoiceRecorder: Audio capture interface with recording controls
- FileUpload: Drag-and-drop audio file upload with validation
- VoiceModelCard: Display and management of trained voice models
- TextToSpeechGenerator: Text input and voice selection for speech generation
- AudioPlayer: Playback controls for generated audio with waveform visualization
- ProgressIndicator: Real-time training status display

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js for REST API
- **Database ORM:** Drizzle ORM with PostgreSQL (Neon serverless)
- **File Handling:** Multer for multipart/form-data uploads
- **Session Management:** Connect-pg-simple for PostgreSQL-backed sessions

**API Design:**
- RESTful endpoints for voice model management
- File upload endpoints with validation (10MB limit, MP3/WAV only)
- Streaming support for audio file downloads
- Session-based authentication middleware (prepared for Whop SDK integration)

**Service Layer:**
- FishAudioService: Abstraction for Fish Audio API interactions
- Voice model creation with configurable training modes
- Text-to-speech generation with voice model selection
- Webhook support for training status updates

### Data Storage Solutions

**Database Schema (PostgreSQL):**
- **users:** Stores user information with Whop platform integration (whopUserId, whopExperienceId)
- **voiceModels:** Tracks voice model metadata including Fish Audio model ID, training state, and audio file paths
- **generatedAudio:** Records generated speech outputs with text content and audio URLs

**File Storage:**
- Audio files stored in filesystem with path references in database
- Temporary file handling for upload processing
- Support for audio file cleanup and management

**State Management:**
- Voice model training states: created → training → trained/failed
- Real-time status updates via polling (5-second intervals)
- Optimistic UI updates with query invalidation

### External Dependencies

**Third-Party Services:**
- **Fish Audio API:** Core voice cloning and TTS service
  - Voice model training from audio samples
  - Text-to-speech synthesis with custom voices
  - Fast training mode for quick model creation
  - Private visibility for user models

**Database:**
- **Neon Serverless PostgreSQL:** Primary data store
  - WebSocket-based connection pooling
  - Drizzle ORM for type-safe queries
  - Schema migrations via drizzle-kit

**Development Tools:**
- **Replit Integrations:** Development environment plugins
  - Runtime error overlay for debugging
  - Cartographer for code navigation
  - Development banner for environment awareness

**UI Libraries:**
- **Radix UI:** Headless accessible components (accordion, dialog, dropdown, select, etc.)
- **Tailwind CSS:** Utility-first styling framework
- **Lucide React:** Icon library
- **date-fns:** Date formatting utilities

**Authentication (Planned):**
- Whop SDK integration for user authentication and authorization
- Currently using simulated user middleware for development
- Session-based authentication with PostgreSQL storage