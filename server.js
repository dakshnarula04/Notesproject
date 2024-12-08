const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(
  session({
    secret: 'secure-notes-secret', // Use a strong secret in production
    resave: false,
    saveUninitialized: true,
  })
);

// Multer setup for file storage
const upload = multer({ dest: 'uploads/' });

// Simulated database
const uploadsDataPath = path.join(__dirname, 'uploads.json');
let uploadsData = [];

// Load uploads data from file
if (fs.existsSync(uploadsDataPath)) {
  uploadsData = JSON.parse(fs.readFileSync(uploadsDataPath, 'utf8'));
}

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/upload', (req, res) => res.sendFile(path.join(__dirname, 'public', 'upload.html')));
app.get('/search', (req, res) => res.sendFile(path.join(__dirname, 'public', 'search.html')));

// Redirect to password page after upload
app.post('/password', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.send('<h1>File upload failed!</h1><a href="/upload">Go Back</a>');
  }

  // Store file info in session for later use
  req.session.uploadData = {
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    filePath: req.file.path,
    originalName: req.file.originalname,
  };

  res.sendFile(path.join(__dirname, 'public', 'password.html'));
});

// Password authentication
app.post('/validate-password', (req, res) => {
  const correctPassword = '1234';
  const { password } = req.body;

  if (password !== correctPassword) {
    return res.send('<h1>Incorrect Password!</h1><a href="/password">Try Again</a>');
  }

  const uploadData = req.session.uploadData;

  if (uploadData) {
    // Save upload data to the JSON file
    uploadsData.push(uploadData);
    fs.writeFileSync(uploadsDataPath, JSON.stringify(uploadsData, null, 2));

    // Clear session upload data
    req.session.uploadData = null;

    res.send('<h1>Upload Successful!</h1><a href="/">Go Home</a>');
  } else {
    res.send('<h1>Error: No upload data found!</h1><a href="/upload">Go Back</a>');
  }
});

// Search API
app.get('/api/search', (req, res) => {
  const query = req.query.q.toLowerCase();
  const results = uploadsData.filter(note =>
    note.title.toLowerCase().includes(query) ||
    note.description.toLowerCase().includes(query) ||
    note.category.toLowerCase().includes(query)
  );
  res.json(results);
});

// Serve specific uploaded files
app.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('<h1>File not found</h1><a href="/search">Go Back</a>');
  }
});

// 404 handler
app.use((req, res) => res.status(404).send('<h1>404 Not Found</h1><a href="/">Go Home</a>'));

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
