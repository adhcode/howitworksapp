# HowItWorks Admin Dashboard

A modern admin dashboard built with Vite, React, TypeScript, and Tailwind CSS for managing the HowItWorks property management platform.

## Features

- 🔐 **Authentication** - Secure login for admin and facilitator roles
- 👥 **Facilitator Management** - Create, view, edit, and delete facilitators
- 🏠 **Property Management** - View properties and assign facilitators
- 🔧 **Maintenance Tracking** - Monitor and manage maintenance requests
- 📊 **Dashboard Analytics** - Overview of platform statistics
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS

## Tech Stack

- **Vite** - Fast build tool and dev server
- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Zustand** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS
- **Lucide React** - Icon library
- **date-fns** - Date formatting

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running (default: http://localhost:3000)

### Installation

1. Navigate to the admin dashboard directory:
```bash
cd admin-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your API URL:
```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=HowItWorks Admin
```

5. Start the development server:
```bash
npm run dev
```

The dashboard will be available at `http://localhost:3001`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
admin-dashboard/
├── src/
│   ├── components/
│   │   ├── layouts/
│   │   │   └── DashboardLayout.tsx
│   │   ├── facilitators/
│   │   │   ├── CreateFacilitatorModal.tsx
│   │   │   └── FacilitatorDetailsModal.tsx
│   │   └── properties/
│   │       └── AssignFacilitatorModal.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Facilitators.tsx
│   │   ├── Properties.tsx
│   │   ├── Maintenance.tsx
│   │   ├── Landlords.tsx
│   │   ├── Settings.tsx
│   │   └── LoginPage.tsx
│   ├── store/
│   │   └── authStore.ts
│   ├── lib/
│   │   ├── api.ts
│   │   └── utils.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Features in Detail

### Authentication
- Login with email and password
- Role-based access (admin/facilitator)
- JWT token management
- Automatic token refresh
- Secure logout

### Facilitator Management
- View all facilitators in a grid layout
- Create new facilitators with form validation
- View facilitator details and assigned properties
- Delete facilitators with confirmation
- Track active/inactive status

### Property Management
- View all properties with pagination
- See property details (units, tenants, rent)
- Assign facilitators to properties
- Filter unassigned properties
- Track property statistics

### Maintenance Tracking
- View all maintenance requests
- Filter by status and priority
- Update request status
- View request details and history
- Track pending vs completed requests

### Dashboard
- Overview statistics
- Recent maintenance requests
- Unassigned properties alert
- Quick access to key metrics

## API Integration

The dashboard connects to the backend API with the following endpoints:

### Auth
- `POST /auth/login` - User login

### Facilitators
- `GET /facilitators` - List all facilitators
- `GET /facilitators/:id` - Get facilitator details
- `POST /facilitators` - Create facilitator
- `PATCH /facilitators/:id` - Update facilitator
- `DELETE /facilitators/:id` - Delete facilitator
- `GET /facilitators/:id/properties` - Get assigned properties

### Properties
- `GET /properties` - List all properties
- `GET /properties/:id` - Get property details
- `PATCH /properties/:id` - Update property (assign facilitator)

### Maintenance
- `GET /landlord/maintenance` - List maintenance requests
- `GET /landlord/maintenance/:id` - Get request details
- `PATCH /landlord/maintenance/:id` - Update request status

## Environment Variables

```env
VITE_API_URL=http://localhost:3000  # Backend API URL
VITE_APP_NAME=HowItWorks Admin      # Application name
```

## Development

### Running Tests
```bash
npm run test
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run type-check
```

## Deployment

### Deploy to Vercel
```bash
vercel
```

### Deploy to Netlify
```bash
netlify deploy --prod
```

### Deploy to Custom Server
1. Build the project: `npm run build`
2. Upload the `dist` folder to your server
3. Configure your web server to serve the files
4. Set up environment variables

## Security

- All API requests include JWT authentication
- Tokens stored securely in localStorage
- Automatic logout on token expiration
- Role-based access control
- HTTPS recommended for production

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Proprietary - All rights reserved

## Support

For support, email support@howitworks.app
