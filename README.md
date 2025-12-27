# 🚀 DexCode Backend

Welcome to the backend of the **DexCode** project\! This document breaks down the server-side code, explaining its architecture, core concepts, and how to get it up and running on your local machine.

-----

## 📂 Backend Directory Structure

A well-organized folder structure is crucial for a scalable project. Here’s a look at how the DexCode backend is organized, following a standard Node.js/Express pattern:

```
backend/
├── 📁 config/
│   └── db.js           # Database connection logic
├── 📁 controllers/
│   └── userController.js # Handles logic for user-related requests
├── 📁 middlewares/
│   └── authMiddleware.js # Protects routes by verifying tokens
├── 📁 models/
│   └── User.js         # Mongoose schema for the User model
├── 📁 routes/
│   └── userRoutes.js   # Defines API endpoints for users
├── .env                  # Stores environment variables (database URI, secrets)
├── package.json          # Lists project dependencies and scripts
└── server.js             # The main entry point for the application
```

  * **`config/`**: Holds configuration files, like the setup for your database connection.
  * **`controllers/`**: This is where the core logic lives. Controllers take requests from the routes, process them, and send back a response.
  * **`middlewares/`**: These are helper functions that run *between* the request and the controller. Perfect for tasks like checking if a user is logged in (`authMiddleware.js`).
  * **`models/`**: Defines the data structure. Each file in this folder typically corresponds to a collection in your database, defining its schema.
  * **`routes/`**: Contains the API endpoints. It maps specific URLs (e.g., `/api/users`) to the correct controller functions.
  * **`.env`**: A crucial file for security. It stores sensitive information like database passwords and API keys, keeping them out of your source code.
  * **`server.js`**: The heart of the application. It initializes the Express server, connects to the database, and wires up all the routes and middlewares.

-----

## 🏗️ What are Controllers?

Think of **controllers** as the "brains" 🧠 of your API. They are functions that handle the business logic for each API endpoint. When a client sends a request to a specific URL, the router calls the corresponding controller function to figure out what to do.

**A typical controller workflow:**

1.  Receives the request from the router.
2.  Validates any incoming data.
3.  Interacts with the `models` to fetch or save data in the database.
4.  Sends a JSON response back to the client.

**Example of a Controller Function:**

```javascript
// controllers/userController.js
const User = require('../models/User');

// @desc    Create a new user
// @route   POST /api/users
exports.createUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
```

-----

## 🛡️ What are Middlewares?

**Middlewares** are functions that act like security guards or gatekeepers for your API routes. They execute *before* the main controller logic runs, giving you the power to intercept and modify the request.

Common uses for middleware include:

  * **Authentication**: Checking for a valid token to see if a user is logged in.
  * **Authorization**: Verifying if a logged-in user has permission to access a specific resource.
  * **Logging**: Recording details about every request for debugging.
  * **Error Handling**: A central place to catch and manage errors.

**Example of an Authentication Middleware:**

```javascript
// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  const token = req.header('x-auth-token');

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'Access denied, no token provided' });
  }

  // Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Add user payload to the request
    next(); // Pass control to the next middleware or controller
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};
```

-----

## ⚙️ Running the Project Locally

Ready to run the server? Just follow these simple steps.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/heetjain17/DexCode.git
    ```
2.  **Navigate to the backend directory:**
    ```bash
    cd DexCode/backend
    ```
3.  **Install all the required packages:**
    ```bash
    npm install
    ```
4.  **Create a `.env` file** in the `backend` directory. Copy the contents of `.env.example` (if it exists) and fill in your database connection string, JWT secret, and other variables.
5.  **Start the server\!**
    ```bash
    npm start
    ```

Your backend should now be live and ready to handle requests\! 🎉
