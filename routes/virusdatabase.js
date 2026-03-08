const express = require('express');
const readHTML = require('../readHTML.js');
const router = express.Router();
router.use(express.json());
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'database', 'tricell_intranet.db');
const db = new Database(dbPath);

router.use(express.static('./public'));
var htmlHead = readHTML('./masterframe/head.html');
var htmlHeader = readHTML('./masterframe/header.html');
var htmlMenu = readHTML('./masterframe/menu_back.html');
var htmlInfoStart = readHTML('./masterframe/infoStart.html');
var htmlInfoStop = readHTML('./masterframe/infoStop.html');
var htmlFooter = readHTML('./masterframe/footer.html');
var htmlBottom = readHTML('./masterframe/bottom.html');
var htmlVirusDatabaseStart = readHTML('./masterframe/virusdatabasestart.html')
var htmlVirusDatabaseStop = readHTML('./masterframe/virusdatabasestop.html')




router.get('/', function (request, response) {


  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(htmlHead);
  response.write(htmlHeader);
  response.write(htmlMenu);
  response.write(htmlInfoStart);

  // skapa tabell struktur för de inhämtade värdena

  response.write(htmlVirusDatabaseStart);

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

    let tableRowsHtml = "";
    combinedData.forEach(virus => {
      tableRowsHtml += `
    <div class="row">
        <div class="table_cell_values">${virus.objectNumber}</div>
        <div class="table_cell_values_name"><a href="http://localhost:3000/api/personnelregistry/${virus.employeeCode}">${virus.objectName} </a></div>
        <div class="table_cell_values">${virus.objectCreatedDate}</div>
        <div class="table_cell_values">${virus.objectCreator}</div>
        <div class="table_cell_values">${virus.entries}</div>
        <div class="table_cell_values">${virus.lastChangedDate}</div>

    </div>`;

    });
    response.write(tableRowsHtml)
  } catch (error) {
    console.error("Databasfel:", error);
    response.write("<p>Kunde inte hämta virusdata från databasen.</p>");
  }

  response.write(htmlVirusDatabaseStop);
  response.write(htmlInfoStop);
  response.write(htmlFooter);
  response.write(htmlBottom);
  response.end();

  //response.send(personnel);
});

module.exports = router;