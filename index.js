const config = require('./config/globals.json');
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const session = require('express-session');
const SessionStore = require('better-sqlite3-session-store')(session);
const Database = require('better-sqlite3');
const checkAuth = require('./authMiddleware.js'); // Se till att sökvägen stämmer
const db = new Database('./users.db'); // Din befintliga DB
const cookieParser = require('cookie-parser');
app.use(cookieParser());

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
const deletevirus = require('./routes/deletevirus');
const editvirus = require('./routes/editvirus');
const newemployee = require('./routes/newemployee')
const deleteemployee = require('./routes/deleteemployee');

app.use(express.static('./public'));

const readHTML = require('./readHTML.js');
var htmlHead = readHTML('./masterframe/head.html');
var htmlHeader = readHTML('./masterframe/header.html');
var htmlMenu = readHTML('./masterframe/menu.html');
var htmlInfoStart = readHTML('./masterframe/infoStart.html');
var htmlIndex = readHTML('./public/texts/index.html');
var htmlInfoStop = readHTML('./masterframe/infoStop.html');
var htmlFooter = readHTML('./masterframe/footer.html');
var htmlBottom = readHTML('./masterframe/bottom.html');

app.get('/', function (request, response) {

    response.send(htmlHead + htmlHeader + htmlMenu + htmlInfoStart + htmlIndex + htmlInfoStop + htmlFooter + htmlBottom);
    response.end();
});

app.use('/api/info', info);
app.use('/api/personnelregistry', personnelregistry);
app.use('/api/login', login);
app.use('/api/virusdatabase', virusdatabase);

// Allt under denna rad kräver nu inloggning!
app.use(checkAuth);
app.use('/api/admin', admin);
app.use('/api/virusdatabase/deletvirus', deletevirus);
app.use('/api/virusdatabase/editvirus', editvirus);
app.use('/api/newemployee', newemployee);
app.use('/api/deleteemployee', deleteemployee);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
