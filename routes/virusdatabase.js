const express = require('express');
const readHTML = require('../readHTML.js');
const router = express.Router();
router.use(express.json());
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'database', 'data.db');
const db = new Database(dbPath);

router.use(express.static('./public'));
var htmlVirusDatabaseStart = readHTML('./masterframe/virusdatabasestart.html')
var htmlVirusDatabaseStop = readHTML('./masterframe/virusdatabasestop.html')




router.get('/', function (request, response) {

  // läs in och extrahera värdena ur XML filen
  try {
    const combinedData = db.prepare(`
            SELECT 
                o.objectNumber, 
                o.objectName, 
                o.objectCreatedDate, 
                o.objectCreator, 
                max(e.entryDate) AS lastChangedDate,  
                o.entries 
            FROM ResearchObjects o
            LEFT JOIN ResearchEntries e ON o.id = e.researchObjectId
            GROUP by o.id
            ORDER BY o.objectNumber ASC
        `).all();

    var tableRowsHtml = "";
    combinedData.forEach(virus => {
      tableRowsHtml += `
    <div class="row">
        <div class="table_cell_values">${virus.objectNumber}</div>
        <div class="table_cell_values_name"><a href="http://localhost:3000/api/virusdatabase/${virus.objectNumber}">${virus.objectName} </a></div>
        <div class="table_cell_values">${virus.objectCreatedDate}</div>
        <div class="table_cell_values">${virus.objectCreator}</div>
        <div class="table_cell_values">${virus.entries}</div>
        <div class="table_cell_values">${virus.lastChangedDate}</div>

    </div>`;

    });
  } catch (error) {
    console.error("Databasfel:", error);
    response.write("<p>Kunde inte hämta virusdata från databasen.</p>");
  }


  const currentUserId = request.session.userId || null;
  const fullContent =
    htmlVirusDatabaseStart +
    tableRowsHtml +
    htmlVirusDatabaseStop;

  // 3. Skicka detta objekt till din EJS-fil
  response.render('user', {
    userId: currentUserId, // Nu är variabeln DEFINIERAD för EJS
    employeecode: request.cookies.employeecode,
    name: request.cookies.name,
    logintimes: request.cookies.logintimes,
    lastlogin: request.cookies.lastlogin,
    menu: readHTML('./masterframe/menu_back.html'),
    content: fullContent
  })
});

module.exports = router;

router.get('/:virusId', function (request, response) {
  const targetId = request.params.virusId;
  // läs in och extrahera värdena ur XML filen
  try {
    const combinedData = db.prepare(`
            SELECT 
                o.objectNumber, 
                o.objectName, 
                o.objectCreatedDate, 
                o.objectCreator, 
                max(e.entryDate) AS lastChangedDate,  
                o.entries 
            FROM ResearchObjects o
            LEFT JOIN ResearchEntries e ON o.id = e.researchObjectId
            GROUP by o.id
            ORDER BY o.objectNumber ASC
        `).all();

    var tableRowsHtml = "";
    combinedData.forEach(virus => {
      tableRowsHtml += `
    <div class="row">
        <div class="table_cell_values">${virus.objectNumber}</div>
        <div class="table_cell_values_name"><a href="http://localhost:3000/api/virusdatabase/${virus.objectNumber}">${virus.objectName} </a></div>
        <div class="table_cell_values">${virus.objectCreatedDate}</div>
        <div class="table_cell_values">${virus.objectCreator}</div>
        <div class="table_cell_values">${virus.entries}</div>
        <div class="table_cell_values">${virus.lastChangedDate}</div>

    </div>`;

    });
  } catch (error) {
    console.error("Databasfel:", error);
    response.write("<p>Kunde inte hämta virusdata från databasen.</p>");
  }


  const currentUserId = request.session.userId || null;
  const fullContent =
    htmlVirusDatabaseStart +
    tableRowsHtml +
    htmlVirusDatabaseStop;

  // 3. Skicka detta objekt till din EJS-fil
  response.render('user', {
    userId: currentUserId, // Nu är variabeln DEFINIERAD för EJS
    employeecode: request.cookies.employeecode,
    name: request.cookies.name,
    logintimes: request.cookies.logintimes,
    lastlogin: request.cookies.lastlogin,
    menu: readHTML('./masterframe/menu_back.html'),
    content: fullContent
  })
});

module.exports = router;