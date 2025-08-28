# 🏠 Homezy - Property Management System

A complete property management solution built with modern technologies for landlords and tenants.

## 🚀 Features

### 👨‍💼 For Landlords
- **Property Management**: Add, edit, and manage multiple properties
- **Unit Management**: Create and manage individual units within properties
- **Tenant Invitations**: Send secure invitation tokens to tenants
- **Rent Tracking**: Monitor rent payments and due dates
- **Maintenance Requests**: View and manage tenant maintenance requests
- **Messaging**: Communicate with tenants directly
- **Dashboard**: Comprehensive overview of all properties and tenants

### 🏡 For Tenants
- **Property Information**: View current property and unit details
- **Payment Tracking**: Monitor rent due dates and payment history
- **Maintenance Requests**: Submit maintenance issues with photo uploads
- **Quick Messaging**: Send messages to property managers
- **Profile Management**: Update personal information and settings

## 🛠 Tech Stack

### Backend
- **Framework**: NestJS with Fastify
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with email verification
- **File Upload**: Fastify multipart with local storage
- **Email**: Nodemailer with Gmail SMTP
- **Documentation**: Swagger/OpenAPI

### Mobile App
- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: React Context
- **UI Components**: Custom components with Material Icons
- **Image Handling**: Expo Image Picker
- **Build System**: EAS Build

### Infrastructure
- **Hosting**: Railway (Backend + PostgreSQL)
- **Mobile Distribution**: EAS Build (APK/AAB)
- **Version Control**: Git + GitHub

## 📱 Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL
- Expo CLI
- Railway CLI (for deployment)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run db:generate
npm run db:migrate
npm run start:dev
```

### Mobile Setup
```bash
cd mobile
npm install
npx expo start
```

## 🚀 Deployment

### Backend (Railway)
```bash
cd backend
railway login
railway init
railway add --database postgres
railway up
```

### Mobile (EAS Build)
```bash
cd mobile
npx eas login
npx eas build:configure
npx eas build -p android --profile production
```

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/verify-email` - Email verification

### Properties
- `GET /properties` - Get user properties
- `POST /properties` - Create property
- `GET /properties/:id/with-units` - Get property with units
- `POST /properties/:id/units` - Add unit to property

### Tenants
- `POST /tenant-invitations` - Send tenant invitation
- `GET /tenants/my-data` - Get tenant dashboard data
- `POST /maintenance/requests` - Submit maintenance request

### Messaging
- `POST /messages` - Send message
- `GET /messages/conversations` - Get conversations
- `GET /maintenance/requests` - Get maintenance requests

## 🎨 UI Features

- **Modern Design**: Clean, professional interface
- **Dark/Light Theme**: Consistent color scheme
- **Responsive Layout**: Works on all screen sizes
- **Smooth Animations**: Enhanced user experience
- **Error Handling**: Comprehensive error states
- **Loading States**: Visual feedback for all actions

## 🔐 Security

- JWT authentication with secure token storage
- Email verification for new accounts
- Role-based access control (Landlord/Tenant)
- Input validation and sanitization
- CORS configuration for mobile apps
- Secure file upload handling

## 📄 License

This project is private and proprietary.

## 👥 Contributors

- **Developer**: ADH Code
- **Project**: Homezy Property Management System
