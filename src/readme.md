# Harassment Reporting Backend API

Node.js + Express + MongoDB backend for the Harassment Reporting System.

## Features

- User authentication (signup, signin, JWT tokens)
- Report submission with file uploads
- Anonymous reporting support
- Report status tracking
- Resources API
- Secure password hashing with bcrypt
- Input validation with express-validator
- File upload handling with multer

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables:**
   Edit `.env` file and set:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A secure random string for JWT signing
   - `FRONTEND_URL` - Your frontend URL (for CORS)
   - `PORT` - Server port (default: 5000)

4. **Create uploads directory:**
   ```bash
   mkdir uploads
   ```

## Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication

**POST** `/api/auth/signup`
- Body: `{ fullName, email, password }`
- Returns: JWT token and user data

**POST** `/api/auth/signin`
- Body: `{ email, password }`
- Returns: JWT token and user data

**GET** `/api/auth/me`
- Headers: `Authorization: Bearer <token>`
- Returns: Current user data

### Reports

**POST** `/api/reports`
- Headers: `Authorization: Bearer <token>` (optional for anonymous)
- Body: `multipart/form-data` with:
  - `category` (verbal|physical|cyberbullying|discrimination|other)
  - `title`
  - `description`
  - `incidentDate`
  - `location`
  - `isAnonymous` (true|false)
  - `evidence` (files, max 5)
- Returns: Report data with case ID

**GET** `/api/reports/my-reports`
- Headers: `Authorization: Bearer <token>`
- Returns: Array of user's reports

**GET** `/api/reports/:id`
- Headers: `Authorization: Bearer <token>`
- Returns: Single report details

**PATCH** `/api/reports/:id/status`
- Headers: `Authorization: Bearer <token>`
- Body: `{ status, updateMessage }`
- Returns: Updated report

### Resources

**GET** `/api/resources`
- Public endpoint
- Returns: Array of support resources

## MongoDB Collections

### users
```javascript
{
  _id: ObjectId,
  fullName: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

### reports
```javascript
{
  _id: ObjectId,
  caseId: String (unique, auto-generated),
  userId: ObjectId (ref: User, nullable),
  category: String (enum),
  title: String,
  description: String,
  incidentDate: Date,
  location: String,
  isAnonymous: Boolean,
  status: String (enum: pending, under_review, resolved, closed),
  evidenceFiles: [{
    filename: String,
    path: String,
    uploadedAt: Date
  }],
  updates: [{
    message: String,
    updatedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## Deployment

### Heroku
```bash
heroku create your-app-name
heroku addons:create mongolab
git push heroku main
```

### Railway
1. Connect your GitHub repository
2. Add MongoDB plugin
3. Set environment variables
4. Deploy

### DigitalOcean App Platform
1. Create new app
2. Connect repository
3. Add MongoDB database
4. Configure environment variables
5. Deploy

## Security Notes

- Always use HTTPS in production
- Keep JWT_SECRET secure and random
- Implement rate limiting for production
- Add input sanitization for all user inputs
- Use environment variables for sensitive data
- Implement proper role-based access control
- Regularly update dependencies

## File Structure

```
server/
├── models/
│   ├── User.js          # User schema
│   └── Report.js        # Report schema
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── reports.js       # Report routes
│   └── resources.js     # Resources routes
├── middleware/
│   └── auth.js          # Authentication middleware
├── uploads/             # File uploads directory
├── .env.example         # Environment variables template
├── server.js            # Main server file
├── package.json         # Dependencies
└── README.md           # This file
```

## Connecting to Frontend

In your HTML files, replace the `// TODO: Connect to your database` comments with API calls:

```javascript
// Example: Sign in
const response = await fetch('http://localhost:5000/api/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const data = await response.json();
localStorage.setItem('token', data.token);

// Example: Submit report with auth
const formData = new FormData();
formData.append('category', category);
formData.append('title', title);
// ... add other fields

const response = await fetch('http://localhost:5000/api/reports', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: formData
});
```

## Support

For issues and questions, please check the documentation or create an issue in the repository.
