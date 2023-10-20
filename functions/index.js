const {onRequest} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions/v2");
setGlobalOptions({maxInstances: 10});
const expres= require("express");
const cors = require("cors");
const admin = require("firebase-admin");
// Credenciales en: "Configuración de proyecto > Cuentas de servicio"
const serviceAccount = require("./credential.json");

// Inicializando al admin dentro de Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


const app= expres();
app.use(cors({origin: true}));

// Base de datos
const db = admin.firestore();

// Bienvenida a la ruta raíz
app.get("/", async (req, res)=>{
  try {
    res.send("Este es el servidor de:");
  } catch (error) {
    console.error(error);
  }
});

// ------------------------RUTAS:
// POST
app.post("/name-link", async (req, res) => {
  try {
    await db.collection("nameDB").doc().create({
      namevariable: req.body.namevariable,
    });
    return res.status(200).send("Add element");
  } catch (e) {
    console.log(e);
  }
});

// GET
app.get("/name-link", async (req, res) => {
  try {
    const {docs} = await db.collection("nameDB").get();
    const valoresDentroDB = docs.map((e) => ({id: e.id, ...e.data()}));
    if (!valoresDentroDB.length) return res.status(400).send("No hay usuarios");
    return res.status(200).json(valoresDentroDB);
  } catch (e) {
    console.log(e);
  }
});

// PUT
app.put("/name-link/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const dataToUpdate = req.body; // Datos a actualizar
    await db.collection("nameDB").doc(id).set(dataToUpdate, {merge: true});
    return res.status(200).send(`Elemento con ID ${id} actualizado`);
  } catch (e) {
    console.error(e);
    return res.status(500).send("Error al actualizar el elemento");
  }
});

// DELETE
app.delete("/name-link/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await db.collection("nameDB").doc(id).delete();
    return res.status(200).send(`Elemento con ID ${id} eliminado`);
  } catch (e) {
    console.error(e);
    return res.status(500).send("Error al eliminar el elemento");
  }
});

exports.app = onRequest(app);
