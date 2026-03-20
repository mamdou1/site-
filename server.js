const express = require("express");
const app = express();
const sequelize = require("./config/database");

app.get("/", (req, res) => {
  res.send("Hello world !");
});


app.use("/api/exemple", require("./routes/exemple.routes"));

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
