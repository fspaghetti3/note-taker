const express = require('express');
const fs = require('fs')
const path = require('path');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.static('public'));
app.use(express.json());

const dbPath = path.join(__dirname, 'db', 'db.json');

const readDB = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const writeDB = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/public/index.html')));

app.get('/notes', (req, res) => res.sendFile(path.join(__dirname, '/public/notes.html')));

app.get('/api/notes', (req, res) => {
    try {
        const data = readDB();
        res.json(data.notes);
    } catch (error) {
        console.error('Error reading db.json:', error);
        res.status(500).json({ error: "Internal server error." });
    }
});

app.post('/api/notes', (req, res) => {
    try {
        const newNote = req.body;
        const data = readDB();

        newNote.id = data.notes.length ? data.notes[data.notes.length - 1].id + 1 : 1;
        data.notes.push(newNote);

        writeDB(data);

        res.json(newNote);
    } catch (error) {
        console.error('Error in POST /api/notes:', error);
        res.status(500).json({ error: "Internal server error." });
    }
});

app.delete('/api/notes/:id', (req, res) => {
    try {
        const noteId = parseInt(req.params.id);
        const data = readDB();

        const updatedNotes = data.notes.filter(note => note.id !== noteId);
        data.notes = updatedNotes;

        writeDB(data);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/notes/:id:', error);
        res.status(500).json({ error: "Internal server error." });
    }
});

app.listen(PORT, () => console.log(`App listening on port ${PORT}`));