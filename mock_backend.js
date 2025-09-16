const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3001;

// Enable CORS for frontend
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Mock user database
const users = [
  {
    id: '1',
    email: 'demo@simplesetup.ae',
    password: 'password123',
    firstName: 'Demo',
    lastName: 'User',
    fullName: 'Demo User'
  },
  {
    id: '2', 
    email: 'client@simplesetup.ae',
    password: 'password123',
    firstName: 'Ahmed',
    lastName: 'Al-Rashid',
    fullName: 'Ahmed Al-Rashid'
  },
  {
    id: '3',
    email: 'business@simplesetup.ae', 
    password: 'password123',
    firstName: 'Fatima',
    lastName: 'Al-Zahra',
    fullName: 'Fatima Al-Zahra'
  },
  {
    id: '4',
    email: 'corporate@simplesetup.ae',
    password: 'password123', 
    firstName: 'Mohammad',
    lastName: 'Al-Maktoum',
    fullName: 'Mohammad Al-Maktoum'
  },
  {
    id: '5',
    email: 'admin@simplesetup.ae',
    password: 'admin123456',
    firstName: 'Sarah', 
    lastName: 'Administrator',
    fullName: 'Sarah Administrator'
  },
  {
    id: '6',
    email: 'support@simplesetup.ae',
    password: 'support123',
    firstName: 'Omar',
    lastName: 'Support', 
    fullName: 'Omar Support'
  },
  {
    id: '7',
    email: 'accountant@simplesetup.ae',
    password: 'accounting123',
    firstName: 'Layla',
    lastName: 'Al-Accountant',
    fullName: 'Layla Al-Accountant'
  }
];

// Mock session storage
const sessions = new Map();

// Health check
app.get('/up', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Dashboard endpoint
app.get('/api/v1/dashboard', (req, res) => {
  const sessionId = req.cookies?.session_id;
  const user = sessions.get(sessionId);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  console.log(`📊 Dashboard accessed by: ${user.email}`);

  // Return mock dashboard data
  res.json({
    success: true,
    data: {
      companies: [
        {
          id: '1',
          name: 'Sample Tech Solutions LLC',
          trade_name: 'SampleTech',
          free_zone: 'IFZA',
          status: 'in_progress',
          license_status: 'setting_up',
          formation_progress: 65,
          license_type: 'IFZA Freezone License',
          license_expiry_date: '2025-12-31T00:00:00Z',
          license_renewal_days: 365,
          official_email: 'info@sampletech.com',
          phone: '+971501234567',
          website: 'https://sampletech.com',
          shareholders: [
            {
              id: '1',
              full_name: 'John Smith',
              identification_type: 'Passport',
              identification_number: 'AB123456',
              passport_number: 'AB123456',
              passport_expiry_date: '2026-06-15T00:00:00Z',
              share_percentage: 100,
              type: 'shareholder'
            }
          ],
          directors: [
            {
              id: '1',
              full_name: 'John Smith',
              identification_type: 'Passport',
              identification_number: 'AB123456',
              passport_number: 'AB123456',
              passport_expiry_date: '2026-06-15T00:00:00Z',
              type: 'director'
            }
          ],
          documents: {
            trade_license: {
              id: '1',
              name: 'Trade License',
              file_name: 'trade_license.pdf',
              uploaded_at: '2024-01-15T10:00:00Z',
              verified: true,
              download_url: '/api/v1/documents/1/download'
            },
            moa: {
              id: '2',
              name: 'Memorandum of Association',
              file_name: 'moa.pdf',
              uploaded_at: '2024-01-15T11:00:00Z',
              verified: true,
              download_url: '/api/v1/documents/2/download'
            }
          },
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-20T15:30:00Z'
        }
      ],
      notifications: [
        {
          id: 'license_expiry_1',
          type: 'license_expiry',
          title: 'License Renewal Due Soon',
          message: 'Your license for Sample Tech Solutions LLC expires in 365 days',
          company_id: '1',
          company_name: 'Sample Tech Solutions LLC',
          urgency: 'low',
          created_at: '2024-01-20T10:00:00Z'
        },
        {
          id: 'formation_progress_1',
          type: 'formation_progress',
          title: 'Complete Company Formation',
          message: 'Sample Tech Solutions LLC formation is 65% complete',
          company_id: '1',
          company_name: 'Sample Tech Solutions LLC',
          urgency: 'medium',
          created_at: '2024-01-20T10:00:00Z'
        }
      ],
      stats: {
        total_companies: 1,
        in_progress: 1,
        completed: 0,
        documents_pending: 0
      }
    }
  });
});

// Sign in endpoint
app.post('/api/v1/auth/sign_in', (req, res) => {
  const { email, password } = req.body;
  
  console.log(`🔐 Login attempt: ${email}`);
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    const sessionId = Math.random().toString(36).substring(7);
    sessions.set(sessionId, user);
    
    res.cookie('session_id', sessionId, { 
      httpOnly: true, 
      maxAge: 24 * 60 * 60 * 1000,  // 24 hours
      sameSite: 'lax'
    });
    
    console.log(`✅ Login successful: ${user.email}`);
    
    res.json({
      success: true,
      message: 'Logged in successfully.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName
      },
      sessionTimeout: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });
  } else {
    console.log(`❌ Login failed: ${email}`);
    res.status(401).json({
      success: false,
      message: 'Invalid email or password.'
    });
  }
});

// Current user endpoint
app.get('/api/v1/auth/me', (req, res) => {
  const sessionId = req.cookies?.session_id;
  const user = sessions.get(sessionId);
  
  if (user) {
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }
});

// Sign out endpoint
app.delete('/api/v1/auth/sign_out', (req, res) => {
  const sessionId = req.cookies?.session_id;
  
  console.log(`🚪 Logout attempt for session: ${sessionId}`);
  
  if (sessionId) {
    sessions.delete(sessionId);
    console.log(`✅ Session ${sessionId} cleared`);
  }
  
  // Clear all possible session cookies
  res.clearCookie('session_id', { 
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  });
  res.clearCookie('_simple_setup_session', { 
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  });
  
  console.log(`✅ Logout successful`);
  
  res.json({
    success: true,
    message: 'Logged out successfully.'
  });
});

// User registration endpoint (mock)
app.post('/users', (req, res) => {
  const { user } = req.body;
  
  console.log(`📝 Registration attempt: ${user.email}`);
  
  // Check if user already exists
  const existingUser = users.find(u => u.email === user.email);
  if (existingUser) {
    return res.status(422).json({
      success: false,
      message: 'Email already taken',
      errors: ['Email has already been taken']
    });
  }
  
  // Create new user
  const newUser = {
    id: String(users.length + 1),
    email: user.email,
    password: user.password,
    firstName: user.first_name,
    lastName: user.last_name,
    fullName: `${user.first_name} ${user.last_name}`
  };
  
  users.push(newUser);
  
  console.log(`✅ Registration successful: ${newUser.email}`);
  
  res.json({
    success: true,
    message: 'Account created successfully.',
    user: {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      fullName: newUser.fullName
    }
  });
});

// Middleware is already added above

app.listen(port, () => {
  console.log(`🚀 Mock Backend Server running at http://localhost:${port}`);
  console.log(`📋 Demo Accounts Available:`);
  users.forEach(user => {
    console.log(`   📧 ${user.email} / ${user.password}`);
  });
  console.log(`\n🌐 Test at: http://localhost:3000/sign-in`);
});
