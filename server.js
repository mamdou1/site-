const express = require("express");
const app = express();
const sequelize = require("./config/database");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const { updateActivity } = require("./middlewares/updateActivity.middleware");
const { verifyToken } = require("./middlewares/auth.middleware");

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

// ✅ Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// fichiers statiques
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", require("./routes/auth.routes"));

app.use(verifyToken);
app.use(updateActivity);

app.unsubscribe("/api/users", require("./routes/user.routes"));

require("./models");

app.use("/api/exemple", require("./routes/exemple.routes"));
app.use("/api/service", require("./routes/service.routes"));
app.use("/api/solution", require("./routes/solution.routes"));
app.use("/api/entreprise", require("./routes/entreprise.routes"));
app.use("/api/notification", require("./routes/notification.routes"));

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route non trouvée" });
});

sequelize
  .authenticate()
  .then(async () => {
    console.log("✅ Connexion MySQL réussie");

    await sequelize.sync();
    // 4️⃣ Lancer le serveur
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Serveur lancé sur le port ${process.env.PORT}`);
    });
  })
  .catch(console.error);
