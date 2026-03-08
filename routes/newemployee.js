const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
var formidable = require('formidable');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(express.json());
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'database', 'tricell_intranet.db');
const db = new Database(dbPath);
const checkAuth = require('../authMiddleware.js'); // Se till att sökvägen stämmer

router.use(express.static('./public'));


// --------------------- Läs in Masterframen --------------------------------
const readHTML = require('../readHTML.js');
const fs = require('fs');

var htmlHead = readHTML('./masterframe/head.html');
var htmlHeader = readHTML('./masterframe/header.html');
var htmlMenu = readHTML('./masterframe/menu.html');
var htmlInfoStart = readHTML('./masterframe/infoStart.html');
var htmlInfoStop = readHTML('./masterframe/infoStop.html');
var htmlFooter = readHTML('./masterframe/footer.html');
var htmlBottom = readHTML('./masterframe/bottom.html');

var htmlLoggedinMenuCSS = readHTML('./masterframe/loggedinmenu_css.html');
var htmlLoggedinMenuJS = readHTML('./masterframe/loggedinmenu_js.html');
var htmlLoggedinMenu = readHTML('./masterframe/loggedinmenu.html');

// ---------------------- Lägg till ny person ------------------------------------------------
router.post('/', function (request, response) {
    var form = new formidable.IncomingForm();
    form.parse(request, function (err, fields, files) {
        if (err) {
            console.error("Form error:", err);
            return;
        }

        // Fix: Hämta det första elementet [0] från varje fält för Formidable v3
        var employeecode = fields.femployeecode ? fields.femployeecode[0] : null;
        var name = fields.fname ? fields.fname[0] : null;
        var dateofbirth = fields.fdateofbirth ? fields.fdateofbirth[0] : null;
        var height = fields.fheight ? fields.fheight[0] : null;
        var weight = fields.fweight ? fields.fweight[0] : null;
        var bloodtype = fields.fbloodtype ? fields.fbloodtype[0] : null;
        var sex = fields.fsex ? fields.fsex[0] : null;
        var rank = fields.frank ? fields.frank[0] : null;
        var department = fields.fdepartment ? fields.fdepartment[0] : null;
        var securityaccesslevel = fields.fsecurityaccess ? fields.fsecurityaccess[0] : null;
        var background = fields.fbackground ? fields.fbackground[0] : null;
        var strengths = fields.fstrengths ? fields.fstrengths[0] : null;
        var weaknesses = fields.fweaknesses ? fields.fweaknesses[0] : null;

        console.log("Bearbetat namn:", name); // Nu bör detta visa namnet som en sträng, inte [ 'namn' ]

        // Skapa inskrivningsdatum
        let ts = Date.now();
        let date_ob = new Date(ts);
        let date = String(date_ob.getDate()).padStart(2, '0');
        let month = String(date_ob.getMonth() + 1).padStart(2, '0');
        let year = date_ob.getFullYear();
        let signaturedate = date + "." + month + "." + year;

        response.setHeader('Content-type', 'text/html');
        response.write(htmlHead);

        if (request.session && request.session.userId) {
            response.write(htmlLoggedinMenuCSS);
            response.write(htmlLoggedinMenuJS);
            response.write(htmlLoggedinMenu);
        }

        response.write(htmlHeader);
        response.write(htmlMenu);
        response.write(htmlInfoStart);

        try {
            const insert = db.prepare(`
                INSERT INTO employees (employeeCode, name, signatureDate, dateOfBirth, height, weight, bloodType, sex, rank, department, securityAccessLevel, background, strengths, weaknesses) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            // Kör insättningen med de "rensade" variablerna
            insert.run(employeecode, name, signaturedate, dateofbirth, height, weight, bloodtype, sex, rank, department, securityaccesslevel, background, strengths, weaknesses);

            response.write("<h2>Personal registrerad</h2>");
            response.write("<p>Den anställde <strong>" + name + "</strong> har lagts till i Tricells register.</p>");
            response.write("<br/><p /><a href=\"http://localhost:3000/api/newemployee\" style=\"color:#336699;text-decoration:none;\">Lägg till en till anställd</a>");

        } catch (err) {
            console.error("Databasfel:", err);
            response.write("<h2 style='color:red;'>Ett fel uppstod</h2>");
            response.write("<p>Kunde inte lägga till personal. Koden (" + employeecode + ") existerar förmodligen redan.</p>");
            response.write("<br/><a href='javascript:history.back()'>Gå tillbaka och korrigera</a>");
        }

        response.write(htmlInfoStop);
        response.write(htmlFooter);
        response.write(htmlBottom);
        response.end();
    });
});



// ---------------------- Formulär för att lägga till ny person ------------------------------
router.get('/', checkAuth, (request, response) => {
    response.setHeader('Content-type', 'text/html');
    response.write(htmlHead);
    if (request.session && request.session.userId) {
        response.write(htmlLoggedinMenuCSS);
        response.write(htmlLoggedinMenuJS);
        response.write(htmlLoggedinMenu);
    }
    response.write(htmlHeader);
    response.write(htmlMenu);
    response.write(htmlInfoStart);

    // Läs in formuläret
    if (request.session && request.session.userId) {
        htmlNewEmployeeCSS = readHTML('./masterframe/newemployee_css.html');
        response.write(htmlNewEmployeeCSS);
        htmlNewEmployeeJS = readHTML('./masterframe/newemployee_js.html');
        response.write(htmlNewEmployeeJS);
        htmlNewEmployee = readHTML('./masterframe/newemployee.html');
        response.write(htmlNewEmployee);
    }
    else {
        response.write("Not logged in");
    }
    response.write(htmlInfoStop);
    response.write(htmlFooter);
    response.write(htmlBottom);
    response.end();
});

module.exports = router;