# Edgardo Hernandez "The App"

A passwordless authentication web app built with Expo (web + mobile ready) and AWS Serverless backend.

## Project Structure

```
/
├── apps/
│   └── client/          # Expo app (web today, mobile later)
├── services/
│   └── api/             # Serverless backend (Lambda + DynamoDB)
└── README.md
```

## Prerequisites

- Node.js 18+
- npm or yarn
- AWS CLI configured (for deployment)
- Expo CLI: `npm install -g expo-cli`

## Local Development

### Backend Setup

1. Navigate to backend:
```bash
cd services/api
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
- `JWT_SECRET`: Random secret for JWT signing
- `SES_FROM_EMAIL`: Verified SES email address
- `APP_BASE_URL`: Base URL for magic links (e.g., `http://localhost:8081`)
- `AWS_REGION`: AWS region (e.g., `us-east-1`)

5. Start local development server:
```bash
npm run dev
```

This runs Serverless Offline on `http://localhost:3000`

6. Seed initial data:
```bash
npm run seed
```

### Frontend Setup

1. Navigate to frontend:
```bash
cd apps/client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
- `EXPO_PUBLIC_API_BASE_URL`: Backend API URL (e.g., `http://localhost:3000/dev`)

5. Start Expo development server:
```bash
npm start
```

Then press `w` to open in web browser, or scan QR code for mobile.

## Deployment

### Backend Deployment

1. Configure AWS credentials:
```bash
aws configure
```

2. Deploy to AWS:
```bash
cd services/api
npm run deploy
```

3. Update frontend `.env` with production API URL:
```
EXPO_PUBLIC_API_BASE_URL=https://your-api-id.execute-api.region.amazonaws.com/prod
```

### Frontend Deployment (Web)

The Expo web build can be deployed to any static hosting (Vercel, Netlify, etc.):

```bash
cd apps/client
npm run build:web
```

## Environment Variables

### Backend (.env)
- `JWT_SECRET`: Secret for JWT signing
- `SES_FROM_EMAIL`: Verified SES sender email
- `APP_BASE_URL`: Base URL for magic links
- `AWS_REGION`: AWS region

### Frontend (.env)
- `EXPO_PUBLIC_API_BASE_URL`: Backend API base URL

## Features

- ✅ Passwordless authentication (Magic Link + OTP)
- ✅ User profile management
- ✅ Dynamic form rendering
- ✅ Form submissions with backend processing
- ✅ Results display

## Tech Stack

- **Frontend**: Expo (React Native) with expo-router
- **Backend**: AWS Lambda + API Gateway + DynamoDB + SES
- **Infrastructure**: Serverless Framework
- **Language**: TypeScript
- **Validation**: Zod

