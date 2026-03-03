const config = require('./config/globals.json');
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const session = require('express-session');
const SessionStore = require('better-sqlite3-session-store')(session);
const Database = require('better-sqlite3');

const db = new Database('./users.db'); // Din befintliga DB

app.use(session({
    store: new SessionStore({
        client: db,
        tableName: 'sessions' // Denna skapas automatiskt i din users.db
    }),
    secret: 'tricell-secret-key', // Byt till något unikt
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Mycket viktigt på localhost!
        maxAge: 1000 * 60 * 60 * 24, // 24 timmar
        httpOnly: true,
        sameSite: 'lax'

    }
}));

// läser in routers
const info = require('./routes/info');
const personnelregistry = require('./routes/personnelregistry');
const login = require('./routes/login');
const virusdatabase = require('./routes/virusdatabase');
const admin = require('./routes/admin');


app.use(express.static('./public'));

const readHTML = require('./readHTML.js');
var htmlHead = readHTML('./head.html');
var htmlHeader = readHTML('./header.html');
var htmlMenu = readHTML('./menu.html');
var htmlInfoStart = readHTML('./infoStart.html');
var htmlIndex = readHTML('./public/texts/index.html');
var htmlInfoStop = readHTML('./infoStop.html');
var htmlFooter = readHTML('./footer.html');
var htmlBottom = readHTML('./bottom.html');

app.get('/', function (request, response) {
    response.send(htmlHead + htmlHeader + htmlMenu + htmlInfoStart + htmlIndex + htmlInfoStop + htmlFooter + htmlBottom);
    response.end();
});

app.use('/api/info', info);
app.use('/api/personnelregistry', personnelregistry);
app.use('/api/login', login);
app.use('/api/virusdatabase', virusdatabase);
app.use('/api/admin', admin)

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
