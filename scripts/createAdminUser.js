const inscription = require("../controllers/auth.controller");

// Simulation d'une requête Express
async function createAdminUser() {
  // Données de l’admin par défaut
  const req = {
    body: {
      nom: "Administrateur",
      prenom: "Système",
      email: "admin@systeme.local",
      telephone: "0000000000",
      password: "admin123",
      role: "ADMIN",
      username: "admin1234",
    },
  };

  // Faux objet réponse pour afficher le résultat dans la console
  const res = {
    status: (code) => ({
      json: (data) => {
        console.log(`\n📊 Status: ${code}`);
        console.log("Réponse:", data);
      },
    }),
  };

  console.log("🚀 Début de la création de l'utilisateur administrateur...");
  await inscription.inscription(req, res);
  console.log("🏁 Fin du script");
}

createAdminUser();
