const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
var formidable = require('formidable');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.use(express.static('./public'));
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, '..', 'data', 'database', 'tricell_intranet.db');
const db = new Database(dbPath);

const pug = require('pug');
const { response } = require('express');
const pug_loggedinmenu = pug.compileFile('./masterframe/loggedinmenu.html');
const pug_editemployee = pug.compileFile('./masterframe/editemployee.html');



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


// ---------------------- Editera person ------------------------------------------------
// --------------------- Uppdatera en person -------------------------------
// Ändra router.put till router.post
router.post('/update/:employeeId', function (request, response) {
    const targetId = request.params.employeeId;

    // Om du använder ett vanligt formulär ligger datan i request.body
    // Men vi måste se till att namnen matchar databasen.
    const b = request.body;

    const updates = {
        employeeCode: b.femployeecode,
        name: b.fname,
        dateOfBirth: b.fdateofbirth,
        sex: b.fsex,
        bloodType: b.fbloodtype,
        height: b.fheight,
        weight: b.fweight,
        department: b.fdepartment,
        rank: b.frank,
        securityAccessLevel: b.fsecurityaccess,
        background: b.fbackground,
        strengths: b.fstrengths,
        weaknesses: b.fweaknesses
    };

    try {
        const keys = Object.keys(updates);
        const setClause = keys.map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);

        const sql = `UPDATE employees SET ${setClause} WHERE employeeCode = ?`;
        db.prepare(sql).run(...values, targetId);

        response.redirect('/api/editemployee/' + targetId); // Skicka användaren tillbaka till sidan
    } catch (error) {
        console.error(error);
        response.status(500).send('Kunde inte uppdatera');
    }
});


// ---------------------- Formulär för att editera person ------------------------------
router.get('/:id', (request, response) => {
    var id = request.params.id;


    // Läs nuvarande värden ur databasen
    const row = db.prepare("SELECT * FROM employees WHERE employeeCode= ?").get(id);

    let str_employeeCode = row.employeeCode;
    let str_name = row.name
    let str_dateOfBirth = row.dateOfBirth;
    let str_rank = row.rank;
    let str_securityAccessLevel = row.securityAccessLevel;
    let str_signatureDate = row.signatureDate;
    let str_sex = row.sex;
    let str_bloodType = row.bloodType;
    let str_height = row.height;
    let str_weight = row.weight;
    let str_department = row.department;
    let str_background = row.background;
    let str_strengths = row.strengths;
    let str_weaknesses = row.weaknesses;

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


    // Kollar om personen har ett foto
    const path = "./public/photos/" + str_employeeCode + ".jpg";
    if (fs.existsSync(path)) {
        photo = "photos/" + str_employeeCode + ".jpg";
    }
    else {
        photo = "images/default.jpg";
    }


    htmlNewEmployeeCSS = readHTML('./masterframe/newemployee_css.html');
    response.write(htmlNewEmployeeCSS);
    htmlNewEmployeeJS = readHTML('./masterframe/newemployee_js.html');
    response.write(htmlNewEmployeeJS);
    //htmlNewEmployee = readHTML('./masterframe/editemployee.html');
    //response.write(htmlNewEmployee);
    response.write(pug_editemployee({
        photo: photo,
        id: str_employeeCode,
        employeecode: str_employeeCode,
        name: str_name,
        dateofbirth: str_dateOfBirth,
        signaturedate: str_signatureDate,
        sex: str_sex,
        bloodtype: str_bloodType,
        height: str_height,
        weight: str_weight,
        rank: str_rank,
        securityaccesslevel: str_securityAccessLevel,
        department: str_department,
        background: str_background,
        strengths: str_strengths,
        weaknesses: str_weaknesses,
        security_A: str_securityAccessLevel === 'A',
        security_B: str_securityAccessLevel === 'B',
        security_C: str_securityAccessLevel === 'C',
        sex_Male: str_sex === 'Male',
        sex_Female: str_sex === 'Female',
        sex_Other: str_sex === 'Other'
    }));

    response.write(htmlInfoStop);
    response.write(htmlFooter);
    response.write(htmlBottom);
    response.end();



});

module.exports = router;