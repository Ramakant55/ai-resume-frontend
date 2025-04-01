# AI Resume Screener Frontend

A modern React application that serves as the frontend for the AI Resume Screener system. This application provides interfaces for both job seekers and employers/admins to interact with the AI resume screening platform.

## Features

### For Job Seekers
- User registration and authentication with OTP verification
- Browse and search for job listings
- View detailed job information
- Apply to jobs with resume upload
- Dashboard to track application status
- Profile management

### For Employers/Admins
- Comprehensive admin dashboard
- Job posting and management
- Review and filter applications
- AI-powered candidate matching based on resume analysis
- Application status management

## Tech Stack

- **Framework**: React with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Form Handling**: Formik with Yup validation
- **HTTP Client**: Axios
- **Notifications**: React Toastify
- **Icons**: React Icons

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-resume-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
ai-resume-frontend/
├── public/              # Static files
├── src/
│   ├── assets/          # Images, fonts, etc.
│   ├── components/      # Reusable UI components
│   │   └── layouts/     # Layout components
│   ├── context/         # React context providers
│   ├── pages/           # Application pages
│   │   ├── admin/       # Admin pages
│   │   ├── auth/        # Authentication pages
│   │   └── user/        # User pages
│   ├── services/        # API service functions
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main app component
│   ├── index.css        # Global styles
│   └── main.jsx         # App entry point
├── .gitignore
├── index.html
├── package.json
├── README.md
├── vite.config.js
└── tailwind.config.js
```

## API Integration

This frontend application is designed to work with the AI Resume Screener backend API. The API endpoints used include:

- Authentication: `/api/auth/signup`, `/api/auth/verify-otp`, `/api/auth/login`
- Jobs: `/api/jobs/get-jobs`, `/api/jobs/post-job`, `/api/jobs/review`
- Applications: `/api/applications/apply`, `/api/applications/allapp`, `/api/applications/update-status`, `/api/applications/filter-by-skills`

## Deployment

To build the application for production:

```bash
npm run build
```

This will generate a `dist` directory with the production-ready assets.

## License

[MIT](LICENSE)
