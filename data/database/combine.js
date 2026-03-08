const Database = require('better-sqlite3');
const path = require('path');

// Öppna huvuddatabasen
const db = new Database('tricell_intranet.db', { verbose: console.log });

try {
    // 1. Koppla på den andra databasen
    // Vi använder en absolut sökväg för att vara säkra på att den hittas
    const usersDbPath = path.resolve('users.db');
    db.prepare(`ATTACH DATABASE '${usersDbPath}' AS users_src`).run();

    console.log("Koppling lyckades. Påbörjar flytt...");

    // 2. Flytta 'employees' från users.db men döp om den till 'user_credentials'
    // Denna tabell innehåller lösenord, inloggningsförsök etc.
    db.prepare(`
        CREATE TABLE user_credentials AS 
        SELECT * FROM users_src.employees
    `).run();
    console.log("Tabellen 'employees' (från users.db) har flyttats och döpts om till 'user_credentials'.");

    // 3. Flytta 'sessions' tabellen (eftersom den inte finns i huvud-db)
    db.prepare(`
        CREATE TABLE sessions AS 
        SELECT * FROM users_src.sessions
    `).run();
    console.log("Tabellen 'sessions' har flyttats.");

    // 4. Koppla ifrån users.db
    db.prepare("DETACH DATABASE users_src").run();

    console.log("\nKlart! Nu finns allt i tricell_intranet.db.");
    console.log("Tabeller i din databas nu:");
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.table(tables);

} catch (err) {
    console.error("Ett fel uppstod:", err.message);
} finally {
    db.close();
}