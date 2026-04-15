// scripts/create-admin.js
const bcrypt = require('bcrypt');
const { Users } = require('../models');
const sequelize = require('../config/database');

async function createAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');

    const adminData = {
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
    };

    // Vérifier si l'admin existe déjà
    const existingAdmin = await Users.findOne({
      where: { email: adminData.email }
    });

    if (existingAdmin) {
      console.log('⚠️  Un administrateur existe déjà avec cet email');
      console.log('Email:', existingAdmin.email);
      console.log('Rôle:', existingAdmin.role);
      return;
    }

    const admin = await Users.create(adminData);
    console.log('✅ Administrateur créé avec succès !');
    console.log('Email:', admin.email);
    console.log('Mot de passe: Admin123!');
    console.log('Rôle:', admin.role);
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error.message);
  } finally {
    await sequelize.close();
  }
}

createAdmin();