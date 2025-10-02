# Shift Manager - Frontend Application

A modern, responsive frontend application for managing clinic staff shifts, built with React, TypeScript, and Tailwind CSS.

## Features

### 📅 Daily Shifts View

- View shift assignments for any date
- Navigate between dates with previous/next buttons
- Quick "Go to Today" option
- Filter by clinic
- View clinic roster with assigned doctors and dental assistants
- Status indicators: Present, Visiting, No Staff Assigned
- View unassigned staff with their status (Weekly Off, Approved Leave, Unapproved Leave, Available)

### 👥 Staff Management

- View all staff members
- See staff details: role, email, primary clinic, weekly off day
- Active/Inactive status indicators
- Easy-to-use interface for staff administration

### 📋 Leave Management

- View all leave requests
- Filter by status: All, Pending, Approved, Rejected
- See leave type (Planned/Emergency)
- Approve or reject pending requests
- View leave period and reasons

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **date-fns** - Date manipulation
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js 20.x
- npm or yarn

### Installation

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/           # Reusable UI components
│   │   │   ├── DateNavigator.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── layout/           # Layout components
│   │   │   ├── Header.tsx
│   │   │   └── Navigation.tsx
│   │   └── shifts/           # Shift-specific components
│   │       ├── ClinicCard.tsx
│   │       └── StaffCard.tsx
│   ├── data/                 # Mock data
│   │   └── mockData.ts
│   ├── pages/                # Page components
│   │   ├── DailyShifts.tsx
│   │   ├── StaffManagement.tsx
│   │   └── LeaveManagement.tsx
│   ├── types/                # TypeScript type definitions
│   │   └── models.ts
│   ├── utils/                # Utility functions
│   │   ├── dateUtils.ts
│   │   └── rosterUtils.ts
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Mock Data

The application uses mock data to demonstrate functionality:

- **3 Clinics**: Central Clinic (Downtown), North Branch (Northside), East Branch (Eastwood)
- **8 Staff Members**: 4 Doctors and 4 Dental Assistants
- **Sample shift assignments** for October 2, 2025
- **2 Leave requests** (1 pending, 1 approved)

## Key Components

### DateNavigator

- Date selection with previous/next navigation
- Displays current date in readable format
- Quick access to today's date

### ClinicCard

- Shows clinic name and location
- Displays assigned doctor and dental assistant
- Status badge (Present/Visiting/No Staff Assigned)
- Edit buttons for staff assignments

### StaffCard

- Shows unassigned staff member details
- Status indicators for availability
- Role-based display

### StatusBadge

- Visual indicators for different statuses
- Color-coded badges with icons
- Supports multiple status types

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Design Philosophy

The application follows a clean, minimal design inspired by modern mobile applications:

- **Card-based layout** - Easy to scan and understand
- **Subtle gradients** - Professional appearance
- **Clear typography** - Excellent readability
- **Intuitive navigation** - Simple tab-based navigation
- **Status indicators** - Visual feedback at a glance

## Future Enhancements

- Real-time updates with WebSocket
- Staff assignment modal
- Drag-and-drop shift assignments
- Calendar view for leave requests
- Export to PDF
- Push notifications
- Mobile app version

## License

This project is part of the Midline Shift Roster system.
