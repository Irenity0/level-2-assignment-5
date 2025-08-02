# Digital Wallet API

A secure, modular, and role-based **backend API** for a digital wallet system built with Express.js, TypeScript, and MongoDB.

## 🚀 Features

- **JWT-based Authentication** with role-based authorization
- **Three User Roles**: Admin, User, Agent
- **Secure Password Hashing** using bcrypt
- **Automatic Wallet Creation** with ৳50 initial balance
- **Transaction Management** with atomic operations
- **Role-based Route Protection**
- **RESTful API Design**
- **Comprehensive Error Handling**

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB + Mongoose
- **Security**: JWT, bcrypt
- **Validation**: Zod
- **Other**: CORS, cookie-parser, rate limiting

## 📦 Installation & Setup

1. **Prerequisites**
   - Node.js (v16 or higher)
   - MongoDB (running locally or MongoDB Atlas)

2. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd digital-wallet-api
\`\`\`

3. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

4. **Environment Setup**
\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` file with your configuration:
\`\`\`env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/digital-wallet
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
\`\`\`

5. **Start MongoDB**
Make sure MongoDB is running on your system:
\`\`\`bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# Or use MongoDB Atlas cloud database
\`\`\`

6. **Seed the database (optional)**
\`\`\`bash
node scripts/seed-data.js
\`\`\`

7. **Start the server**
\`\`\`bash
# Development mode with auto-reload
npm run dev

# Production build
npm run build
npm start
\`\`\`

The API will be available at `http://localhost:5000`

## 🧪 API Testing

### Quick Test with cURL

\`\`\`bash
# Health check
curl http://localhost:5000/health

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","phone":"01234567890","password":"password123","role":"user"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
\`\`\`


### Test Accounts (after running seed script)

\`\`\`
Admin: admin@digitalwallet.com / admin123
User 1: john@example.com / user123  
User 2: jane@example.com / user123
Agent: agent@example.com / agent123
\`\`\`

## 📚 API Endpoints

### 🔐 Authentication
- `POST /api/auth/register` - Register new user/agent
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile

### 💰 Wallet Operations
- `GET /api/wallet` - Get wallet details
- `POST /api/wallet/add-money` - Add money to wallet (User)
- `POST /api/wallet/withdraw` - Withdraw money (User)
- `POST /api/wallet/send-money` - Send money to another user (User)
- `POST /api/wallet/cash-in` - Cash-in for users (Agent)
- `POST /api/wallet/cash-out` - Cash-out for users (Agent)

### 📊 Transactions
- `GET /api/transactions/history` - Get transaction history
- `GET /api/transactions/commission` - Get commission history (Agent)

### 👑 Admin Operations
- `GET /api/admin/users` - Get all users
- `GET /api/admin/wallets` - Get all wallets
- `GET /api/admin/transactions` - Get all transactions
- `PATCH /api/admin/wallets/:walletId/block` - Block wallet
- `PATCH /api/admin/wallets/:walletId/unblock` - Unblock wallet
- `PATCH /api/admin/agents/:userId/approve` - Approve agent
- `PATCH /api/admin/agents/:userId/suspend` - Suspend agent

## 🔐 User Roles & Permissions

### 👤 User
- ✅ Add money to wallet
- ✅ Withdraw money from wallet
- ✅ Send money to other users
- ✅ View transaction history
- ✅ View wallet balance

### 🏪 Agent
- ✅ All user permissions
- ✅ Cash-in for any user
- ✅ Cash-out for any user
- ✅ View commission history
- ✅ Earn 1% commission on cash-in/cash-out

### 👑 Admin
- ✅ View all users, wallets, and transactions
- ✅ Block/unblock user wallets
- ✅ Approve/suspend agents
- ✅ Full system oversight

## 🏗️ Project Structure

\`\`\`
src/
├── modules/
│   ├── auth/           # Authentication logic
│   ├── user/           # User model and logic
│   ├── wallet/         # Wallet operations
│   ├── transaction/    # Transaction management
│   └── admin/          # Admin operations
├── middlewares/        # Custom middlewares
├── config/            # Database configuration
├── utils/             # Utility functions
├── types/             # TypeScript type definitions
├── app.ts             # Express app setup
└── server.ts          # Server entry point
\`\`\`

## 🔒 Security Features

- **JWT Authentication** with secure token generation
- **Password Hashing** using bcrypt with configurable salt rounds
- **Rate Limiting** to prevent abuse (100 requests per 15 minutes)
- **Input Validation** using Zod schemas
- **Role-based Authorization** middleware
- **CORS Protection** with configurable origins
- **Error Handling** with secure error messages
- **MongoDB Injection Protection**

## 🚦 Business Rules

- **Initial Balance**: ৳50 for new users and agents
- **Wallet Blocking**: Blocked wallets cannot perform any operations
- **Agent Approval**: Agents must be approved by admin to perform operations
- **Commission System**: Agents earn 1% commission on cash-in/cash-out
- **Atomic Transactions**: All balance updates are atomic using MongoDB sessions
- **Validation**: Comprehensive validation for all inputs and business logic
- **Minimum Amount**: All transactions must be positive amounts

## 🔧 Development Commands

\`\`\`bash
# Install dependencies
npm install

# Run in development mode with auto-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production build
npm start

# Create admin user
node scripts/create-admin.js

# Seed test data
node scripts/seed-data.js
\`\`\`

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/digital-wallet` |
| `JWT_SECRET` | JWT signing secret | **Required** |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `BCRYPT_SALT_ROUNDS` | Bcrypt salt rounds | `12` |

## 🐛 Error Handling

The API returns consistent error responses:

\`\`\`json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
\`\`\`

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 📊 Database Schema

### Users Collection
\`\`\`javascript
{
  name: String,
  email: String (unique),
  phone: String (unique),
  password: String (hashed),
  role: "user" | "agent" | "admin",
  isActive: Boolean,
  isApproved: Boolean,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### Wallets Collection
\`\`\`javascript
{
  userId: ObjectId (ref: User),
  balance: Number,
  isBlocked: Boolean,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### Transactions Collection
\`\`\`javascript
{
  type: "add_money" | "withdraw" | "send_money" | "cash_in" | "cash_out",
  amount: Number,
  fee: Number,
  commission: Number,
  fromWallet: ObjectId (ref: Wallet),
  toWallet: ObjectId (ref: Wallet),
  initiatedBy: ObjectId (ref: User),
  status: "pending" | "completed" | "failed" | "reversed",
  description: String,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`