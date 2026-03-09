# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue 3 + Vite note-taking application with built-in calculator functionality. Notes are stored in browser localStorage and sync across tabs. The app includes a service worker for offline support.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Architecture

### Core Features

**Calculator Integration**: The app includes a math expression evaluator (using mathjs) that processes each line of a note and displays results in a right-side panel. The calculator:
- Supports variable assignments (e.g., `price = 100`)
- Handles Chinese/Unicode variable names
- Normalizes full-width operators (＋, －, ×, ÷)
- Uses an alias system internally to map user-defined variable names to safe identifiers
- Provides syntax highlighting for numbers, operators, and variables when enabled

**Real-time Sync**: Notes automatically sync across browser tabs using the `storage` event. The implementation prevents circular updates with the `isSyncingFromOtherTab` flag.

**Line Height Measurement**: The calculator results panel uses a mirror DOM technique to measure individual line heights, ensuring results align perfectly with textarea content even with wrapping.

### File Structure

- `src/views/` - Route components (NoteView, ListView, NewView, HelpView)
- `src/utils/storage.js` - localStorage operations for notes (CRUD operations)
- `src/utils/calculator.js` - Math expression evaluator with variable support
- `src/utils/format.js` - Number formatting utilities for calculator results
- `src/router/index.js` - Vue Router configuration
- `public/sw.js` - Service worker for offline support

### Routing

Routes use the pattern `/id-{noteId}` for individual notes. The root path redirects to `/list`.

### State Management

No centralized state management. Each view manages its own state with Vue Composition API. Notes are persisted to localStorage and retrieved on mount.

### Styling

The app uses scoped CSS with a sidebar layout (64px fixed width) and responsive main content area. Calculator results appear in a fixed-width right panel when enabled.

## Key Implementation Details

**NoteView.vue**: The most complex component. It manages:
- Textarea and mirror DOM synchronization for syntax highlighting
- Scroll synchronization between textarea and results panel
- Auto-save on content changes with debouncing via Vue watchers
- Cross-tab sync handling
- Dynamic line height measurement for result alignment

**Calculator**: Variables are aliased internally (e.g., `price` becomes `var_0`) to work with mathjs. The scope persists across lines within a single evaluation, allowing multi-line calculations with variable reuse.

**Storage**: Notes are stored as a single JSON object in localStorage under the key `notes`, with each note keyed by its ID. Empty notes are automatically deleted.



## Coding Style

**Comment**: Code comments should be written in English