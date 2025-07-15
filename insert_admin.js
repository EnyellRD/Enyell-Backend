const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

db.run("INSERT INTO admin (username, password) VALUES (?, ?)", ['admin', '1234'], (err) => {
  if (err) {
    console.error("❌ Error:", err.message);
  } else {
    console.log("✅ Usuario admin insertado correctamente");
  }
  db.close();
});
