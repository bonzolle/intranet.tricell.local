const express = require('express');
const readHTML = require('../readHTML.js');
const router = express.Router();
const fs = require('fs')
router.use(express.json());
//var path = require('path');
const path = require("path");


const pug = require('pug');
const { response } = require('express');
const pug_loggedinmenu = pug.compileFile('./masterframe/loggedinmenu.html');
// Läs in layouten
router.use(express.static('./public'));

var htmlHead = readHTML('./masterframe/head.html');
var htmlHeader = readHTML('./masterframe/header.html');
// var htmlMenu = readHTML('./masterframe/menu.html');    
var htmlInfoStart = readHTML('./masterframe/infoStart.html');
var htmlInfoStop = readHTML('./masterframe/infoStop.html');
var htmlFooter = readHTML('./masterframe/footer.html');
var htmlBottom = readHTML('./masterframe/bottom.html');


// --------------------- Default-sida -------------------------------
router.get('/', function (request, response) {
    var htmlMenu = readHTML('./masterframe/menu.html');

    response.write(htmlHead);
    if (request.session && request.session.userId) {
        htmlLoggedinMenuCSS = readHTML('./masterframe/loggedinmenu_css.html');
        response.write(htmlLoggedinMenuCSS);
        htmlLoggedinMenuJS = readHTML('./masterframe/loggedinmenu_js.html');
        response.write(htmlLoggedinMenuJS);
        htmlLoggedinMenu = readHTML('./masterframe/loggedinmenu.html');
        // response.write(htmlLoggedinMenu);
        response.write(pug_loggedinmenu({
            employeecode: request.cookies.employeecode,
            name: request.cookies.name,
            logintimes: request.cookies.logintimes,
            lastlogin: request.cookies.lastlogin,
        }));

    }
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
        var htmlMenu = readHTML('./masterframe/menu.html');
    }
    else {
        var htmlMenu = readHTML('./masterframe/menu_back.html');
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