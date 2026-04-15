// server.js
const express = require("express");
const app = express();
const sequelize = require("./config/database");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const { updateActivity } = require("./middlewares/updateActivity.middleware");
const { verifyToken } = require("./middlewares/auth.middleware");

console.log('🔵 1. Démarrage du serveur...');

app.get("/", (req, res) => {
  res.send("Hello world !");
});

app.use(
  cors({
    origin: function (origin, callback) {
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-sidebar-navigation"],
  }),
);

console.log('🔵 2. CORS configuré');

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

console.log('🔵 3. Body parser configuré');

// fichiers statiques
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

console.log('🔵 4. Fichiers statiques configurés');
console.log('🔵 5. Chargement des routes auth...');

// ROUTES PUBLIQUES
app.use("/api/auth", require("./routes/auth.routes"));

console.log('🔵 6. Routes auth chargées');

// MIDDLEWARE DE PROTECTION
console.log('🔵 7. Application du middleware verifyToken...');
app.use(verifyToken);
app.use(updateActivity);

console.log('🔵 8. Middleware de protection appliqué');

require("./models");

console.log('🔵 9. Modèles chargés');

// ROUTES PROTÉGÉES
app.use("/api/exemple", require("./routes/exemple.routes"));
app.use("/api/service", require("./routes/service.routes"));
app.use("/api/solution", require("./routes/solution.routes"));
app.use("/api/entreprise", require("./routes/entreprise.routes"));
app.use("/api/notification", require("./routes/notification.routes"));

console.log('🔵 10. Routes protégées chargées');

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route non trouvée" });
});

console.log('🔵 11. Connexion à la base de données...');

sequelize
  .authenticate()
  .then(async () => {
    console.log("✅ Connexion MySQL réussie");
    await sequelize.sync();
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Serveur lancé sur le port ${process.env.PORT}`);
    });
  })
  .catch(console.error);