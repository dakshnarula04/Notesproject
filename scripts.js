const notesDatabase = [
  { id: 1, title: 'Math Notes', description: 'Basic calculus and algebra', file: 'math-notes.pdf' },
  { id: 2, title: 'Physics Notes', description: 'Mechanics and thermodynamics', file: 'physics-notes.pdf' },
  { id: 3, title: 'Computer Science Notes', description: 'Algorithms and Data Structures', file: 'cs-notes.pdf' }
];

function filterNotes() {
  const searchTerm = document.getElementById('search-bar').value.toLowerCase();
  const filteredNotes = notesDatabase.filter(note => 
    note.title.toLowerCase().includes(searchTerm) || 
    note.description.toLowerCase().includes(searchTerm)
  );
  displayNotes(filteredNotes);
}

function displayNotes(notes) {
  const resultsContainer = document.getElementById('search-results');
  resultsContainer.innerHTML = notes.length ? notes.map(note => `
    <div class="note">
      <h3>${note.title}</h3>
      <p>${note.description}</p>
      <button onclick="downloadNote('${note.file}')">Download</button>
    </div>
  `).join('') : '<p>No results found</p>';
}

function downloadNote(filename) {
  const link = document.createElement('a');
  link.href = `/uploads/${filename}`;
  link.download = filename;
  link.click();
}

// JavaScript to handle the form submission and upload notes

document.getElementById('upload-form').addEventListener('submit', async function(event) {
    event.preventDefault();
  
    // Get form data
    const formData = new FormData();
    const title = document.getElementById('note-title').value;
    const description = document.getElementById('note-description').value;
    const file = document.getElementById('note-file').files[0];
  
    // Append form data
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file', file);
  
    // Set authentication headers (user ID and password)
    const headers = {
      'userId': 'user7890',
      'password': '1234',
    };
  
    // Send request to the backend to upload the note
    try {
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        headers: headers,
        body: formData,
      });
  
      const result = await response.json();
  
      if (response.ok) {
        alert('Note uploaded successfully!');
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      alert('Failed to upload note: ' + error.message);
    }
  });
  