const express = require('express');
const router = express.Router();
const readHTML = require('../readHTML.js');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'users.db');
const db = new Database(dbPath);


router.use(express.static('./public'));
var htmlHead = readHTML('./head.html');
var htmlHeader = readHTML('./header.html');
var htmlMenu = readHTML('./menu_back.html');
var htmlInfoStart = readHTML('./infoStart.html');
var htmlInfoStop = readHTML('./infoStop.html');
var htmlFooter = readHTML('./footer.html');
var htmlBottom = readHTML('./bottom.html');
var htmlLoginContainer = readHTML('./login_menu.html')

router.get('/', (request, response) => {

    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(htmlHead);
    response.write(htmlHeader);
    response.write(htmlMenu);
    response.write(htmlInfoStart);
    response.write(htmlLoginContainer);

    response.write(htmlInfoStop);
    response.write(htmlFooter);
    response.write(htmlBottom);
    response.end();

});

module.exports = router;