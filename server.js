import express from 'express';
import { join, dirname } from 'path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const dbFile = join(__dirname, 'db.json');

const adapter = new JSONFile(dbFile);
const db = new Low(adapter, { students: [] });
 
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
app.use(express.static(join(__dirname, 'public'))); 
async function initializeDB() {
    await db.read();
    db.data ||= { students: [] }; 
    await db.write();
}

initializeDB().then(() => {
    console.log("✅ Base de dades LowDB inicialitzada.");
    
    app.get('/api/students', async (req, res) => {
        await db.read();
        const students = db.data.students;
        res.json(students);
    });

    app.post('/api/students', async (req, res) => {
        const { name, email, address } = req.body;
        if (!name || !email || !address) {
            return res.status(400).json({ error: 'Els camps name, email i address són obligatoris.' });
        }

        const newStudent = {
            id: Date.now(), 
            name: name,
            email: email,
            address: address
        };

        await db.read();
        db.data.students.push(newStudent);
        await db.write();

        res.status(201).json(newStudent);
    });

    app.get('/api/students/:id', async (req, res) => {
        const studentId = parseInt(req.params.id);
        await db.read();
        const student = db.data.students.find(s => s.id === studentId);
        
        if (!student) {
            return res.status(404).json({ error: 'Estudiant no trobat.' });
        }

        res.json(student);
    });

    app.put('/api/students/:id', async (req, res) => {
        const studentId = parseInt(req.params.id); 
        const { name, email, address } = req.body;

        await db.read();
        const studentIndex = db.data.students.findIndex(s => s.id === studentId);
        
        if (studentIndex === -1) {
            return res.status(404).json({ error: 'Estudiant no trobat.' });
        }

        if (name !== undefined) db.data.students[studentIndex].name = name;
        if (email !== undefined) db.data.students[studentIndex].email = email;
        if (address !== undefined) db.data.students[studentIndex].address = address;

        await db.write();

        res.json(db.data.students[studentIndex]);
    });

    app.delete('/api/students/:id', async (req, res) => {
        const studentId = parseInt(req.params.id);

        await db.read();
        const initialLength = db.data.students.length;
        
        db.data.students = db.data.students.filter(s => s.id !== studentId);

        if (db.data.students.length === initialLength) {
            return res.status(404).json({ error: 'Estudiant no trobat.' });
        }

        await db.write();
        res.status(204).send();
    });

    app.get('/', (req, res) => {
        res.sendFile(join(__dirname, 'public', 'index.html'));
    });

    app.listen(port, '0.0.0.0', () => {
        console.log(`🚀 Servidor en marxa a http://0.0.0.0:${port}`);
    });
});
