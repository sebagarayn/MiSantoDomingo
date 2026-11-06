import app from "./src/app.js";
import pool from "./src/config/db.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

// Levantamos el servidor en el puerto 3000
app.listen(PORT, async () => {
  console.log(` Servidor corriendo en http://localhost:${PORT}`);

  // Hacemos una consulta rapida a PostgreSQL para verificar la conexion real
  try {
    const test = await pool.query("SELECT NOW()");
    console.log(" Conexion a PostgreSQL verificada:", test.rows[0].now);
  } catch (error) {
    console.error(" Error al conectar con PostgreSQL:", error.message);
  }
});
