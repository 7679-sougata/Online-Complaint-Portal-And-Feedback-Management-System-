import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",            // Your MySQL username
  password: "maTARA@123",        // Your MySQL password
  database: "ocp",         // Your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;