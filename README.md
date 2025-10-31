# PanelSena - Display Management System

A modern, cloud-based display management system built with Next.js, TypeScript, and Firebase. Control and monitor digital displays, manage content, schedule playback, and track analytics in real-time.

## Features

### Authentication & Security
- Email/Password authentication
- Google Sign-In
- Protected routes and user isolation
- Secure Firebase security rules

### Display Management
- Real-time display monitoring
- Online/offline status tracking
- Display configuration (brightness, orientation, resolution)
- Group organization
- Uptime monitoring

### Content Management
- Upload images, videos, and documents
- Firebase Storage integration
- Content categorization and search
- Upload progress tracking
- Thumbnail generation

### Scheduling
- Schedule content to displays
- Recurring schedules (daily, weekly, monthly)
- Multiple displays and content per schedule
- Schedule status management

### Analytics & Monitoring
- Real-time activity feed
- Performance metrics
- Display analytics
- Content engagement tracking

### User Experience
- Modern, responsive UI
- Dark/Light theme support
- Real-time updates
- File upload progress
- Error handling and validation

## Tech Stack

- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Backend**: Firebase
  - Authentication
  - Firestore Database
  - Cloud Storage
- **State Management**: React Hooks
- **Icons**: Lucide React
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Firebase account
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd PanelSena
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Follow the detailed setup guide in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
   - Create a Firebase project
   - Enable Authentication (Email/Password and Google)
   - Create Firestore Database
   - Set up Cloud Storage
   - Deploy security rules

4. Configure environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Firebase credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
PanelSena/
├── app/                      # Next.js app directory
│   ├── dashboard/           # Dashboard pages
│   ├── page.tsx            # Login page
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/              # React components
│   ├── ui/                 # UI components (Radix)
│   ├── display-grid.tsx    # Display management
│   ├── content-library.tsx # Content management
│   ├── protected-route.tsx # Auth guard
│   └── ...
├── hooks/                   # Custom React hooks
│   ├── use-auth.ts         # Authentication hook
│   ├── use-displays.ts     # Display management hook
│   ├── use-content.ts      # Content management hook
│   ├── use-activities.ts   # Activity logging hook
│   ├── use-schedules.ts    # Schedule management hook
│   └── use-analytics.ts    # Analytics hook
├── lib/                     # Utility libraries
│   ├── firebase.ts         # Firebase initialization
│   ├── auth.ts             # Authentication functions
│   ├── firestore.ts        # Firestore operations
│   ├── storage.ts          # Storage operations
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Helper functions
├── firestore.rules          # Firestore security rules
├── storage.rules            # Storage security rules
├── FIREBASE_SETUP.md        # Firebase setup guide
└── README.md               # This file
```

## Firebase Collections

### users
User profiles and account information

### displays
Digital display configurations and status

### content
Uploaded content metadata (images, videos, documents)

### schedules
Content scheduling information

### activities
User activity logs and system events

### analytics
Performance metrics and usage data

## Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## Security

- All data is isolated per user using Firebase security rules
- Users can only access their own resources
- File uploads are validated for type and size (max 100MB)
- Authentication required for all operations
- HTTPS enforced in production

## Firebase Security Rules

Security rules are provided in:
- `firestore.rules` - Database security
- `storage.rules` - File storage security

Deploy them using:
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

## Key Features Implementation

### Real-time Updates
All display data, content, and activities update in real-time using Firestore listeners.

### File Upload
Files are uploaded to Firebase Storage with progress tracking. Metadata is stored in Firestore.

### Authentication
Firebase Authentication with Email/Password and Google Sign-In. Protected routes ensure only authenticated users can access the dashboard.

### Activity Logging
All user actions are logged to the activities collection for audit trails.

### Analytics Tracking
System automatically tracks metrics like display uptime, content views, and user engagement.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Troubleshooting

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for common issues and solutions.

## License

[Add your license here]

## Support

For issues or questions, please open an issue on GitHub.

## Roadmap

- [ ] Mobile app for display control
- [ ] Advanced analytics dashboard
- [ ] Content approval workflow
- [ ] Multi-user collaboration
- [ ] Display health monitoring
- [ ] Automated content scheduling
- [ ] Integration with external content sources
- [ ] Real-time display preview
- [ ] Report generation

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide](https://lucide.dev/)
- Backend by [Firebase](https://firebase.google.com/)
