const config = require('./config/globals.json');
const express = require('express');
const app = express();

const info = require('./routes/info');
const personnelregistry = require('./routes/personnelregistry');
const login = require('./routes/login');
const virusdatabase = require('./routes/virusdatabase');

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
