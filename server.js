import app from "./src/app.js";
import pool from "./src/config/db.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

// Validación de seguridad para JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET;
if (
  !JWT_SECRET ||
  JWT_SECRET === "clave_secreta" ||
  JWT_SECRET === "tu_secreto_aqui"
) {
  console.error(
    "Error crítico: JWT_SECRET no está configurado o usa un valor inseguro por defecto.",
  );
  process.exit(1);
}

// Función de arranque seguro
async function iniciarServidor() {
  try {
    // Verificamos conexión real a PostgreSQL antes de abrir el puerto
    const test = await pool.query("SELECT NOW()");
    console.log(
      "Conexión a PostgreSQL verificada exitosamente:",
      test.rows[0].now,
    );

    // Solo si la base de datos responde levantamos Express
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(
      "Error crítico: No fue posible conectar con PostgreSQL:",
      error.message,
    );
    process.exit(1); // Cortar arranque si la base de datos no responde
  }
}

iniciarServidor();
