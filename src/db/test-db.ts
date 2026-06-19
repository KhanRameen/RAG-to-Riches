import { db } from "./db.js";


const result = await db.query(
  "SELECT NOW()"
);

console.log(result.rows);