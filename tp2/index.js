const express = require('express');
const session = require('express-session');
const Keycloak = require('keycloak-connect');
const db = require('./database');

const app = express();
const PORT = 3000;

// Middleware pour JSON
app.use(express.json());

// Configuration de la session
const memoryStore = new session.MemoryStore();
app.use(session({
    secret: 'api-secret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore
}));

// Initialisation de Keycloak
const keycloak = new Keycloak({ store: memoryStore }, './keycloak-config.json');
app.use(keycloak.middleware());

// Route d'accueil
app.get('/', (req, res) => {
    res.json("Registre de personnes! Choisissez le bon routage!");
});

// Récupérer toutes les personnes (sécurisée)
app.get('/personnes', keycloak.protect(), (req, res) => {
    db.all("SELECT * FROM personnes", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success", "data": rows });
    });
});

// Récupérer une personne par ID (sécurisée)
app.get('/personnes/:id', keycloak.protect(), (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM personnes WHERE id = ?", [id], (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success", "data": row });
    });
});

// Créer une nouvelle personne (sécurisée)
app.post('/personnes', keycloak.protect(), (req, res) => {
    const { nom, adresse } = req.body;
    db.run(`INSERT INTO personnes (nom, adresse) VALUES (?, ?)`, [nom, adresse], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success", "data": { id: this.lastID } });
    });
});

// Mettre à jour une personne (sécurisée)
app.put('/personnes/:id', keycloak.protect(), (req, res) => {
    const id = req.params.id;
    const { nom, adresse } = req.body;
    
    db.run(`UPDATE personnes SET nom = ?, adresse = ? WHERE id = ?`, [nom, adresse, id], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success" });
    });
});

// Supprimer une personne (sécurisée)
app.delete('/personnes/:id', keycloak.protect(), (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM personnes WHERE id = ?`, id, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success" });
    });
});

// Route sécurisée pour tester Keycloak
app.get('/secure', keycloak.protect(), (req, res) => {
    res.json({ message: 'Vous êtes authentifié !' });
});

// Lancer le serveur
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
