import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const { Pool } = pkg;

dotenv.config();

// Workaround for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : null
});

// Initialize Express
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Helper function to hash passwords
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Helper function to verify passwords
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Middleware: JWT Authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // For demo purposes, accept any email/password and return a demo token
    if (email && password) {
      const token = jwt.sign(
        { user_id: 1, email: email, role: 'admin' },
        process.env.JWT_SECRET || 'default-secret-key',
        { expiresIn: '24h' }
      );
      
      res.json({
        token,
        user: {
          user_id: 1,
          email: email,
          name: 'Demo User',
          role: 'admin'
        }
      });
    } else {
      res.status(400).json({ message: 'Email and password required' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tasks endpoint
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    // Return mock tasks for demo
    const mockTasks = [
      {
        task_id: 1,
        title: 'Setup project structure',
        description: 'Initialize the project with proper folder structure',
        status: 'completed',
        priority: 'high',
        created_at: new Date().toISOString(),
        due_date: null
      },
      {
        task_id: 2,
        title: 'Implement user authentication',
        description: 'Add login and registration functionality',
        status: 'in-progress',
        priority: 'high',
        created_at: new Date().toISOString(),
        due_date: null
      },
      {
        task_id: 3,
        title: 'Design dashboard UI',
        description: 'Create wireframes and mockups for the dashboard',
        status: 'todo',
        priority: 'medium',
        created_at: new Date().toISOString(),
        due_date: null
      }
    ];
    res.json(mockTasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// REST API Routes
app.post('/api/users', async (req, res) => {
  try {
    const { email, password, name, role = 'member' } = req.body;
    const password_hash = await hashPassword(password);
    
    // For demo, just return a mock user
    res.status(201).json({
      user_id: Math.floor(Math.random() * 1000),
      email,
      name,
      role,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const { title, description, priority = 'low', due_date, assigned_to } = req.body;
    
    const newTask = {
      task_id: Math.floor(Math.random() * 1000),
      title,
      description,
      status: 'todo',
      priority,
      due_date,
      created_at: new Date().toISOString()
    };
    
    io.emit('task/updated', { taskId: newTask.task_id, updates: newTask });
    res.status(201).json(newTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// WebSocket Events
io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('task/updated', async (data) => {
    try {
      const { task_id, updates } = data;
      io.emit('task/updated', { taskId: task_id, updates });
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Serve static files from frontend build (for production) - must be after API routes
const frontendDistPath = path.join(__dirname, '../vitereact/dist');
app.use(express.static(frontendDistPath));

// Catch-all handler for SPA routing (must be last)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Start server
server.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});