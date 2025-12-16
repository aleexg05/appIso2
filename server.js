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

// --- Configuració de lowdb (Adaptador i Inicialització) ---
const adapter = new JSONFile(dbFile);
const db = new Low(adapter, { students: [] }); // Valor per defecte

// Middleware
app.use(express.json());
// Serveix fitxers estàtics des de la carpeta 'public'
app.use(express.static(join(__dirname, 'public'))); 

// **Funció d'inicialització de la base de dades**
// Llegeix el fitxer db.json i escriu els valors per defecte si està buit.
async function initializeDB() {
    await db.read();
    // Aquesta línia assegura que `db.data` tingui la propietat `students` si el fitxer és nou/buit.
    db.data ||= { students: [] }; 
    await db.write();
}

initializeDB().then(() => {
    console.log("✅ Base de dades LowDB inicialitzada.");
    
    // **Rutes API**
    
    // 1. Obtindre tots els estudiants
    app.get('/api/students', async (req, res) => {
        await db.read(); // Sempre llegeix abans de llegir dades per obtenir l'últim estat
        const students = db.data.students;
        res.json(students);
    });

    // 2. Afegir un nou estudiant (ID amb Timestamp)
    app.post('/api/students', async (req, res) => {
        const { name, email, address } = req.body;
        if (!name || !email || !address) {
            return res.status(400).json({ error: 'Els camps name, email i address són obligatoris.' });
        }

        const newStudent = {
            // Utilitzem Date.now() com a ID (serà un nombre)
            id: Date.now(), 
            name: name,
            email: email,
            address: address
        };

        await db.read();
        db.data.students.push(newStudent);
        await db.write(); // Escriu la base de dades amb el nou estudiant

        res.status(201).json(newStudent);
    });

    // 3. Obtindre un estudiant per ID
    app.get('/api/students/:id', async (req, res) => {
        const studentId = parseInt(req.params.id);
        await db.read();
        const student = db.data.students.find(s => s.id === studentId);
        
        if (!student) {
            return res.status(404).json({ error: 'Estudiant no trobat.' });
        }

        res.json(student);
    });

    // 4. Actualitzar un estudiant
    app.put('/api/students/:id', async (req, res) => {
        // L'ID és un número, assegura't de convertir-lo de la cadena de paràmetres
        const studentId = parseInt(req.params.id); 
        const { name, email, address } = req.body;

        await db.read();
        const studentIndex = db.data.students.findIndex(s => s.id === studentId);
        
        if (studentIndex === -1) {
            return res.status(404).json({ error: 'Estudiant no trobat.' });
        }

        // Actualitza l'estudiant
        if (name !== undefined) db.data.students[studentIndex].name = name;
        if (email !== undefined) db.data.students[studentIndex].email = email;
        if (address !== undefined) db.data.students[studentIndex].address = address;

        await db.write();

        res.json(db.data.students[studentIndex]);
    });

    // 5. Eliminar un estudiant
    app.delete('/api/students/:id', async (req, res) => {
        const studentId = parseInt(req.params.id);

        await db.read();
        const initialLength = db.data.students.length;
        
        // Filtra l'estudiant a eliminar
        db.data.students = db.data.students.filter(s => s.id !== studentId);

        if (db.data.students.length === initialLength) {
            return res.status(404).json({ error: 'Estudiant no trobat.' });
        }

        await db.write();
        res.status(204).send();
    });

    // Serveix l'index.html
    app.get('/', (req, res) => {
        res.sendFile(join(__dirname, 'public', 'index.html'));
    });

    // Inicia el servidor
    app.listen(port, () => {
        console.log(`🚀 Servidor en marxa a http://localhost:${port}`);
    });
});
