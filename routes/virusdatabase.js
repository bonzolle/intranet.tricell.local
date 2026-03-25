const express = require('express');
const readHTML = require('../readHTML.js');
const router = express.Router();
router.use(express.json());
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'database', 'data.db');
const db = new Database(dbPath);

router.use(express.static('./public'));
var htmlVirusDatabaseStart = readHTML('./masterframe/virusdatabasestart.html')
var htmlVirusDatabaseStop = readHTML('./masterframe/virusdatabasestop.html')




router.get('/', function (request, response) {
  let tableRowsHtml = "";
  // läs in och extrahera värdena ur XML filen
  try {
    const combinedData = db.prepare(`
      SELECT 
        o.id as virusnummer,
        o.objectNumber, 
        o.objectName, 
        o.objectCreatedDate, 
        o.objectCreator, 
        MAX(e.entryDate) AS lastChangedDate,  
        COUNT(e.id) AS actualEntries 
      FROM ResearchObjects o
      LEFT JOIN ResearchEntries e ON o.id = e.researchObjectId
      GROUP BY o.id
      ORDER BY o.objectNumber ASC
    `).all();

    console.log(combinedData)

    combinedData.forEach(virus => {
      tableRowsHtml += `
    <div class="row">
        <div class="table_cell_values">${virus.objectNumber}</div>
        <div class="table_cell_values_name"><a href="/api/virusdatabase/${virus.virusnummer}">${virus.objectName} </a></div>
        <div class="table_cell_values">${virus.objectCreatedDate}</div>
        <div class="table_cell_values">${virus.objectCreator}</div>
        <div class="table_cell_values">${virus.actualEntries}</div>
        <div class="table_cell_values">${virus.lastChangedDate || '0'}</div>

    </div>`;

    });
  } catch (error) {
    console.error("Databasfel:", error);
    tableRowsHtml = "<p>Systemet kunde inte ladda data just nu.</p>";

  }


  const currentUserId = request.session.userId || null;
  const fullContent =
    htmlVirusDatabaseStart +
    tableRowsHtml +
    htmlVirusDatabaseStop;

  // 3. Skicka detta objekt till din EJS-fil
  response.render('user', {
    userId: currentUserId, // Nu är variabeln DEFINIERAD för EJS
    cookieemployeecode: request.cookies.employeecode,
    cookiename: request.cookies.name,
    cookielogintimes: request.cookies.logintimes,
    cookielastlogin: request.cookies.lastlogin,
    menu: readHTML('./masterframe/menu_back.html'),
    content: fullContent
  })
});


router.get('/:virusId', function (request, response) {
  const targetId = request.params.virusId;
  const safeVirusId = String(targetId).replace(/[^a-zA-Z0-9_-]/g, '');
  const dirPath = path.join(__dirname, '..', 'data', safeVirusId, 'attachments');

  let attachmentsHTML = '';

  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);

    attachmentsHTML = files.map(file => {
      const fullPath = path.join(dirPath, file);
      const stats = fs.statSync(fullPath);

      return `
      <div class="source_row">
        <span class="source_value">${file}</span>
        <span class="source_size">${(stats.size / 1024).toFixed(1)} KB</span>
        <span class="source_date"></span>
        <div class="source_icons">
          <form method="POST" action="/api/virusdatabase/${safeVirusId}/delete-file" style="display:inline;">
      <input type="hidden" name="fileName" value="${file}">
      <button type="submit">🗑️</button>
    </form>
        </div>
      </div>
    `;
    }).join('');
  } else {
    attachmentsHTML = `<div class="source_row">Inga filer</div>`;
  }
  const virus = db.prepare('SELECT * FROM ResearchObjects WHERE id = ?').get(targetId)
  console.log(targetId)
  if (!virus) {
    console.log("HITTADE INGEN MATCH!");
    return response.status(404).send('virus not found!');
  }

  let htmloutput = `
    <link rel="stylesheet" type="text/css" href="css/viruscss.css">

    
    <div style="padding: 20px;">
        <h1>Research Database:</h1>
        
        <div class="virusRow" style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
                <span id="virus_number" style="font-size: 28px; font-weight: bold;">${virus.objectNumber}</span>
                <span id="virus_name" style="font-size: 24px;">${virus.objectName}</span>
            </div>
            
            <div class="dateTimeCreator" style="text-align: right;">
                Created: ${virus.objectCreatedDate} ${virus.objectCreatedTime}<br>
                By: ${virus.objectCreator}
            </div>
        </div>

        <div id="objectText">
            ${virus.objectText || "Forskningstext saknas i databasen."}
        </div>

        <div id="editbutton">
            <a href="/api/virusdatabase/edit/${virus.ID}" class="edit-btn">Edit info</a>
        </div>
    
  <div id="sources_container">
    <div class="source_row">
        <span class="source_label">Security data sheet:</span>
        <span class="source_value">${virus.objectNumber} ${virus.objectName}.pdf</span>
        <span class="source_size">1300 KB</span>
        <span class="source_date">12.04.2023</span>
        <div class="source_icons">
            <span class="icon_edit">📝</span> 
            <span class="icon_delete">🗑️</span>
        </div>
    </div>

    <div class="source_row">
        <span class="source_label">Security Presentation Video:</span>
        <span class="source_value">http://www.youtube.com/...</span>
        <span class="source_size"></span> <span class="source_date"></span>
        <div class="source_icons">
            <span class="icon_edit">📝</span>
        </div>
    </div>

    <div class="source_row">
        <span class="source_label">Security Handling Video:</span>
        <span class="source_value">http://www.youtube.com/...</span>
        <span class="source_size"></span>
        <span class="source_date"></span>
        <div class="source_icons">
            <span class="icon_edit">📝</span>
        </div>
    </div>
</div>
<div class="addNewFile">
    <p>Upload new file</p>
    <span class="icon_add_file"><a href="/api/data/${safeVirusId}">📝</a></span>
</div>
  <span class="source_label">Attachment:</span>
<div id="sources_container">
  ${attachmentsHTML}
</div>
</div>
`;


  const currentUserId = request.session.userId || null;
  const fullContent =
    htmloutput;


  // 3. Skicka detta objekt till din EJS-fil
  response.render('user', {
    userId: currentUserId, // Nu är variabeln DEFINIERAD för EJS
    cookieemployeecode: request.cookies.employeecode,
    cookiename: request.cookies.name,
    cookielogintimes: request.cookies.logintimes,
    cookielastlogin: request.cookies.lastlogin,
    menu: readHTML('./masterframe/menu_back.html'),
    content: fullContent
  })
});


// edit sidan
router.get('/edit/:virusId', function (request, response) {
  const targetId = request.params.virusId;


  const virus = db.prepare('SELECT * FROM ResearchObjects WHERE id = ?').get(targetId)
  console.log(targetId)
  if (!virus) {
    console.log("HITTADE INGEN MATCH!");
    return response.status(404).send('virus not found!');
  }

  let htmloutput = `
    <form action="/api/virusdatabase/update/${virus.objectNumber}" method="POST">
    <link rel="stylesheet" type="text/css" href="/css/viruscss.css">
    
    <div style="padding: 20px;">
        <h1>Edit Research Entry:</h1>
        
        <div class="virusRow" style="display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
                <label style="display:block; font-size: 10px; font-weight: bold;">OBJECT NUMBER & NAME</label>
                <input type="text" name="objectNumber" value="${virus.objectNumber}" 
                       style="font-size: 28px; font-weight: bold; width: 120px; border: 1px solid #ccc;">
                <input type="text" name="objectName" value="${virus.objectName}" 
                       style="font-size: 24px; width: 300px; border: 1px solid #ccc;">
            </div>
            
            <div class="dateTimeCreator" style="text-align: right; font-size: 12px;">
                Created: ${virus.objectCreatedDate}<br>
                By: ${virus.objectCreator}
            </div>
        </div>

        <div id="objectText" style="padding: 0;"> <textarea name="objectText" 
                      style="width: 100%; height: 200px; border: none; padding: 15px; box-sizing: border-box; font-family: Arial; font-size: 14px;"
            >${virus.objectText}</textarea>
        </div>

        <div style="margin-top: 20px;">
            <button type="submit" class="edit-btn" style="background-color: #548d8d; cursor: pointer;">
                SAVE RESEARCH DATA
            </button>
            <a href="/api/virusdatabase/${virus.objectNumber}" style="margin-left: 10px; color: red;">Cancel</a>
        </div>
    </div>
    </form>
`;


  const currentUserId = request.session.userId || null;
  const fullContent =
    htmloutput;


  // 3. Skicka detta objekt till din EJS-fil
  response.render('user', {
    userId: currentUserId, // Nu är variabeln DEFINIERAD för EJS
    cookieemployeecode: request.cookies.employeecode,
    cookiename: request.cookies.name,
    cookielogintimes: request.cookies.logintimes,
    cookielastlogin: request.cookies.lastlogin,
    menu: readHTML('./masterframe/menu_back.html'),
    content: fullContent
  })
});




//sparar ändringarna
router.post('edit/:virusId', function (request, response) {
  const targetId = request.params.virusId;
  const b = request.body;
  const updates = {
    objectNumber: b.fobjectNumber,
    objectName: b.fobjectName,
    objectText: b.fobjectText
  };

  try {
    // Filtrera bort undefined-värden för att undvika att skriva över med null
    const keys = Object.keys(updates).filter(key => updates[key] !== undefined);
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const values = keys.map(key => updates[key]);

    if (keys.length === 0) {
      return response.status(400).send('Ingen data skickades');
    }

    const sql = `UPDATE ResearchObjects SET ${setClause} WHERE ID = ?`;

    // Kör queryn. Vi skickar med värdena + targetId för WHERE-klausulen
    db.prepare(sql).run(...values, targetId);

    console.log(`Uppdatering lyckades för: ${targetId}`);
    response.redirect('/api/virusdatabase/' + (targetId));
  } catch (error) {
    console.error("SQL Fel:", error);
    response.status(500).send('Kunde inte uppdatera databasen');
  }
});


router.post('/:virusId/delete-file', (req, res) => {
  const virusId = req.params.virusId;
  const fileName = req.body.fileName;

  const safeVirusId = String(virusId).replace(/[^a-zA-Z0-9_-]/g, '');
  const safeFileName = String(fileName).replace(/[^a-zA-Z0-9_.-]/g, '');

  const filePath = path.join(__dirname, '..', 'data', safeVirusId, 'attachments', safeFileName);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log("Deleted:", filePath);
  }

  res.redirect(`/api/virusdatabase/${virusId}`);
});





module.exports = router;