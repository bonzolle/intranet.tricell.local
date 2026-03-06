const express = require('express');
const router = express.Router();
const readHTML = require('../readHTML.js');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'database', 'users.db');
const db = new Database(dbPath);


router.use(express.static('./public'));
var htmlHead = readHTML('./masterframe/head.html');
var htmlHeader = readHTML('./masterframe/header.html');
var htmlMenu = readHTML('./masterframe/menu_back.html');
var htmlInfoStart = readHTML('./masterframe/infoStart.html');
var htmlInfoStop = readHTML('./masterframe/infoStop.html');
var htmlFooter = readHTML('./masterframe/footer.html');
var htmlBottom = readHTML('./masterframe/bottom.html');


router.post('/', (req, res) => {

    const { femployeecode, fpassword } = req.body;

    console.log(req.body)

    // Hämta användaren från tabellen 'employees'
    // I din bild såg kolumnnamnet ut att vara 'employee_code' eller liknande
    try {

        var htmloutput = ""
        // 1. Förbered frågan
        const stmt = db.prepare("SELECT * FROM employees WHERE employeeCode = ?");

        // 2. Kör frågan (get hämtar första matchande raden)
        const row = stmt.get(femployeecode);
        const newAttempts = row.loginTimes + 1;
        console.log(row)
        if (!row) {
            htmloutput += `<div class="loginresponse"> Användaren hittades inte </div>`;
            return renderLoginResponse(res, `<div class="loginresponse">${htmloutput}</div>`);
        } else if (fpassword === row.password && row.lockout === 0) {

            // ökar antalet inlogningsantal
            db.prepare("UPDATE employees SET loginTimes = ? WHERE employeeCode = ?")
                .run(newAttempts, femployeecode);
            // nollställer antalet felaktig inloggningar eftersom inloggningen lyckades
            db.prepare("UPDATE employees SET failedLoginTimes = 0 WHERE employeeCode = ?").run(femployeecode);

            let date = Date.now();
            let dateObj = new Date(date);
            let day = dateObj.getDate();
            let month = dateObj.getMonth() + 1;
            let year = dateObj.getFullYear();
            let str_lastlogin = day + "." + month + "." + year

            const query = db.prepare("UPDATE employees SET lastLogin = ? WHERE employeeCode = ?")

            query.run(str_lastlogin, femployeecode)
            // Set cookies
            res.cookie("employeecode", row.employeeCode);
            res.cookie("name", row.name);
            res.cookie("lastlogin", str_lastlogin);
            res.cookie("logintimes", str_lastlogin);
            req.session.userId = row.employeeCode;
            // SPARA och sen REDIRECT (Detta skickar headers)
            return req.session.save((err) => {
                if (err) return res.status(500).send("Sessionsfel");
                res.redirect('./admin'); // <--- Detta är det enda svaret som skickas
            });


        } else if (fpassword === row.password && row.lockout === 1) {

            htmloutput += `<div class="loginresponse"> Ditt konto är låst. </div>`;
            return renderLoginResponse(res, `<div class="loginresponse">${htmloutput}</div>`);
        } else {
            const newFailedAttempts = row.failedLoginTimes + 1;
            const maxAttempts = 3;

            if (newFailedAttempts >= maxAttempts) { // Lås kontot om man försökt för många gånger
                db.prepare("UPDATE employees SET failedLoginTimes = ?, lockout = 1 WHERE employeeCode = ?")
                    .run(newFailedAttempts, femployeecode);
                htmloutput += `<div class="loginresponse" style="color:red;">För många misslyckade försök. Kontot har låsts.</div>`;
                return renderLoginResponse(res, `<div class="loginresponse">${htmloutput}</div>`);
            } else {
                // Uppdatera bara antal försök
                db.prepare("UPDATE employees SET failedLoginTimes = ? WHERE employeeCode = ?")
                    .run(newFailedAttempts, femployeecode);
                htmloutput += `<div class="loginresponse">Fel lösenord. Försök kvar: ${maxAttempts - newAttempts}</div>`;

                return renderLoginResponse(res, `<div class="loginresponse">${htmloutput}</div>`);

            }
        }
        // res.status(401).send("Fel lösenord");

    } catch (err) {
        console.error(err);
        res.status(500).send("Ett internt fel uppstod");
    }
    console.log("Kollar session:", req.session); // Se vad som finns i minnet
    function renderLoginResponse(res, message) {
        res.write(htmlHead);
        res.write(htmlHeader);
        res.write(htmlMenu);
        res.write(htmlInfoStart);
        res.write(message);
        res.write(htmlInfoStop);
        res.write(htmlFooter);
        res.write(htmlBottom);
        res.end();
    }
});

module.exports = router;