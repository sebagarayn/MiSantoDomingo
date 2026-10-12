import pg from "pg";
import dotenv from "dotenv";

// Cargamos las variables de entorno desde el archivo .env
dotenv.config();

const { Pool } = pg;

// Configuramos la conexion a PostgreSQL con las variables del .env
const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || "misantodomingo_db",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD,
  max: 10, // Maximo de conexiones simultaneas
  idleTimeoutMillis: 30000,
});

// Probamos la conexion apenas levanta
pool.on("connect", () => {
  console.log(" Conectado exitosamente a PostgreSQL (misantodomingo_db)");
});

pool.on("error", (err) => {
  console.error(" Error inesperado en el pool de PostgreSQL:", err.message);
});

// Exportamos pool para poder hacer consultas en los controladores
export default pool;
