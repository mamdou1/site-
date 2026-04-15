// scripts/check-and-create-admin.js
const bcrypt = require('bcrypt');
const { Users } = require('../models');
const sequelize = require('../config/database');

async function checkAndCreateAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');

    // Vérifier si un admin existe
    const adminExists = await Users.findOne({
      where: { email: 'admin@example.com' }
    });

    if (adminExists) {
      console.log('✅ Administrateur existant :');
      console.log('Email:', adminExists.email);
      console.log('Rôle:', adminExists.role);
      console.log('Nom:', adminExists.nom, adminExists.prenom);
      
      // Optionnel : mettre à jour le mot de passe si besoin
      const valid = await bcrypt.compare('Admin123!', adminExists.password);
      if (!valid) {
        console.log('⚠️ Le mot de passe n\'est pas "Admin123!"');
        console.log('Vous devrez peut-être réinitialiser le mot de passe');
      } else {
        console.log('✅ Mot de passe valide');
      }
      return;
    }

    // Créer un nouvel admin
    console.log('📝 Création d\'un nouvel administrateur...');
    
    const admin = await Users.create({
      nom: 'Admin',
      prenom: 'Super',
      username: 'admin',
      email: 'admin@example.com',
      telephone: '0123456789',
      password: await bcrypt.hash('Admin123!', 10),
      role: 'ADMIN',
      nombre_visite: 0,
      photo_profil: '',
      is_verified_for_reset: false
    });

    console.log('✅ Administrateur créé avec succès !');
    console.log('Email:', admin.email);
    console.log('Mot de passe: Admin123!');
    console.log('Rôle:', admin.role);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkAndCreateAdmin();