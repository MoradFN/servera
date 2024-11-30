import express from "express";
import mysql from "mysql2/promise";

const app = express();
const port = 3001;

app.get("/", async (req, res) => {
  res.send("Hello World!");
  const db = await mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "notSecureChangeMe",
    database: "testdb",
  });
  const [results, fields] = await db.query("SELECT * FROM `test`");
  console.log(results, fields);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
