const express = require('express');
const readHTML = require('../readHTML.js');
const router = express.Router();
const fs = require('fs')
router.use(express.json());
//var path = require('path');
const path = require("path");

// Läs in layouten
router.use(express.static('./public'));

var htmlHead = readHTML('./head.html');
var htmlHeader = readHTML('./header.html');
// var htmlMenu = readHTML('./menu.html');    
var htmlInfoStart = readHTML('./infoStart.html');
var htmlInfoStop = readHTML('./infoStop.html');
var htmlFooter = readHTML('./footer.html');
var htmlBottom = readHTML('./bottom.html');


// --------------------- Default-sida -------------------------------
router.get('/', function (request, response) {
    var htmlMenu = readHTML('./menu.html');

    response.write(htmlHead);
    response.write(htmlHeader);
    response.write(htmlMenu);
    response.write(htmlInfoStart);

    htmlInfo = readHTML('./public/texts/index.html');
    response.write(htmlInfo);

    response.write(htmlInfoStop);
    response.write(htmlFooter);
    response.write(htmlBottom);
    response.end();
});


// --------------------- Läs en specifik info-sida -------------------------------
router.get('/:infotext', function (request, response) {
    const infotext = request.params.infotext;
    if (infotext == "") {
        infotext = 'index';
        var htmlMenu = readHTML('./menu.html');
    }
    else {
        var htmlMenu = readHTML('./menu_back.html');
    }

    response.write(htmlHead);
    response.write(htmlHeader);
    response.write(htmlMenu);
    response.write(htmlInfoStart);

    // Läs in rätt info-text
    const filepath = path.resolve(__dirname, "../public/texts/" + infotext + '.html');
    if (fs.existsSync(filepath)) {

        htmlInfo = readHTML('./public/texts/' + infotext + '.html');
    }
    else {
        htmlInfo = readHTML('./public/texts/index.html');
    }
    response.write(htmlInfo);

    response.write(htmlInfoStop);
    response.write(htmlFooter);
    response.write(htmlBottom);
    response.end();
});
module.exports = router;