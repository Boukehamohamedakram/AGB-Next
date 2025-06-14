# E-Banking Backend

This is the backend system for the E-Banking application, built with Flask and SQLite.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the backend directory with the following content:
```
SECRET_KEY=your-super-secret-key-change-this-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-this-in-production
FLASK_ENV=development
FLASK_APP=app.py
```

4. Initialize the database:
```bash
flask db init
flask db migrate
flask db upgrade
```

5. Run the application:
```bash
flask run
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user info

### Users
- GET `/api/users` - Get all users (admin only)
- GET `/api/users/<id>` - Get user by ID
- PUT `/api/users/<id>` - Update user
- DELETE `/api/users/<id>` - Delete user (admin only)

### Accounts
- GET `/api/accounts` - Get user's accounts
- POST `/api/accounts` - Create new account
- GET `/api/accounts/<id>` - Get account by ID
- DELETE `/api/accounts/<id>` - Delete account

### Transactions
- GET `/api/transactions` - Get user's transactions
- POST `/api/transactions` - Create new transaction
- GET `/api/transactions/<id>` - Get transaction by ID

## Transaction Types
- `deposit` - Add money to account
- `withdrawal` - Remove money from account
- `transfer` - Transfer money between accounts

## Security
- All endpoints except registration and login require JWT authentication
- Passwords are hashed using bcrypt
- Admin-only routes are protected
- Users can only access their own data unless they are admin 