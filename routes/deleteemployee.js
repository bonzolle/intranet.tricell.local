const express = require('express');
const router = express.Router();

router.use(express.static('./public'));
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, '..', 'data', 'database', 'tricell_intranet.db');
const db = new Database(dbPath);

const pug = require('pug');
const { response } = require('express');
const pug_loggedinmenu = pug.compileFile('./masterframe/loggedinmenu.html');
const checkAuth = require('../authMiddleware.js'); // Se till att sökvägen stämmer
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


// ---------------------- Radera person ------------------------------------------------
router.get('/:employeecode', checkAuth, function (request, response) {


    // Öppna databasen



    response.setHeader('Content-type', 'text/html');
    response.write(htmlHead);
    response.write(htmlLoggedinMenuCSS);
    response.write(htmlLoggedinMenuJS);
    //response.write(htmlLoggedinMenu);
    response.write(pug_loggedinmenu({
        employeecode: request.cookies.employeecode,
        name: request.cookies.name,
        logintimes: request.cookies.logintimes,
        lastlogin: request.cookies.lastlogin,
    }));

    response.write(htmlHeader);
    response.write(htmlMenu);
    response.write(htmlInfoStart);


    try {
        // Ta reda på användarens employeecode (för att kunna radera bilden)
        const employeeCodeToDelete = request.params.employeecode;

        // Radera direkt från databasen
        const deleteEmployee = db.prepare("DELETE FROM employees WHERE employeeCode = ?");
        const result = deleteEmployee.run(employeeCodeToDelete);

        // Radera bilden
        if (result.changes > 0) {
            // Om raderingen i DB lyckades, ta bort filen
            const path = "./public/photos/" + employeeCodeToDelete + ".jpg";
            if (fs.existsSync(path)) {
                fs.unlinkSync(path);
            }
            response.write("Employee deleted...");
        } else {
            response.write("No employee found with that code.");
        }

        // Ge respons till användaren
        response.write("Employee deleted<br/><p /><a href=\"http://localhost:3000/api/personnelregistry\" style=\"color:#336699;text-decoration:none;\">Delete another employee</a>");
    } catch (error) {
        console.error(error);
        response.status(500).send('Kunde inte uppdatera');
    }


    response.write(htmlInfoStop);
    response.write(htmlFooter);
    response.write(htmlBottom);
    response.end();


});


module.exports = router;