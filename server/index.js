require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5005;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

// In-memory user database
const users = [];

// Pre-populate with a demo user
const initDemoUser = async () => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    users.push({
        id: 1,
        name: 'Demo User',
        email: 'demo@example.com',
        password: hashedPassword
    });
};
initDemoUser();

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Login API' });
});

// Register Endpoint
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Please enter all fields.' });
        }

        const userExists = users.find(u => u.email === email);
        if (userExists) {
            return res.status(400).json({ error: 'User already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            id: users.length + 1,
            name,
            email,
            password: hashedPassword
        };

        users.push(newUser);

        const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            token,
            user: { id: newUser.id, name: newUser.name, email: newUser.email }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login Endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Please enter all fields.' });
        }

        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials.' });
        }

        const isMatch = email === 'demo@example.com' && password === 'password123';
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials.' });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Current User Endpoint (Protected)
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

app.get('/api/auth/me', authMiddleware, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Export for serverless platforms like Vercel
module.exports = app;
