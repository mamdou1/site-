const bcrypt = require("bcrypt");
const { Users, Token } = require("../models");
const { sendEmail } = require("../utils/email.utils");
const jwt = require("jsonwebtoken");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");
const NotificationService = require("../services/notification.service");
const { Op } = require("sequelize");

const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require("../utils/token.utils");
console.log('🚨🚨🚨 FICHIER auth.controller.js CHARGÉ 🚨🚨🚨');
// 🔹 Inscription
exports.inscription = async (req, res) => {
  console.log('🔵🔵🔵 FONCTION CONNEXION APPELLÉE 🔵🔵🔵');
  console.log('Body reçu:', req.body);
  try {
    const {
      nom,
      prenom,
      email,
      telephone,
      password,
      role = "ADMIN",
      username,
    } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await Users.findOne({
      where: {
        [Op.or]: [{ email }, { telephone }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Un utilisateur avec cet email ou ce téléphone existe déjà",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await Users.create({
      nom,
      prenom,
      email,
      telephone,
      password: hash,
      role,
      nombre_visite: 0,
      photo_profil: "",
      is_verified_for_reset: false,
      username,
    });

    await NotificationService.notifyUser(
      user.id,
      "success",
      "Bienvenue sur la plateforme",
      `Bonjour ${nom}, votre compte a été créé avec succès.`,
      { registrationDate: new Date() },
    );

    const userData = await Users.findByPk(user.id, {
      attributes: { exclude: ["password"] },
    });

    res.status(201).json({
      message: "Inscription réussie",
      user: userData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Connexion
exports.connexion = async (req, res) => {
  try {
    const { identifier, password } = req.body;
     console.log('Identifier:', identifier);
    const user = await Users.findOne({
      where: {
        [Op.or]: [
          { username: identifier },
          { email: identifier },
        ],
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      role: user.role,
    });

    await Token.create({ token: refreshToken, user_id: user.id });

    // Mettre à jour la dernière activité
    await user.update({
      last_activity: new Date(),
    });

    await HistoriqueService.log({
      user_id: user.id,
      action: "login",
      resource: "auth/connexion",
      resource_id: req.params.pieceId,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      data: req.files?.map((f) => f.filename),
    });

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
        photo_profil: user.photo_profil,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Rafraîchir le token
exports.refresh = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(403).json({ message: "Token manquant" });

  const stored = await Token.findOne({ where: { token } });
  if (!stored)
    return res.status(403).json({ message: "Refresh token invalide" });

  try {
    const decoded = verifyToken(token, process.env.REFRESH_SECRET);

    const freshAccess = generateAccessToken({
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
    });

    res.json({ accessToken: freshAccess });
  } catch {
    res.status(403).json({ message: "Token expiré" });
  }
};

// 🔹 Déconnexion
exports.deconnexion = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(400).json({ message: "Token requis" });

    await Token.destroy({ where: { token } });

    await Users.update(
      {
        last_activity: new Date(),
      },
      {
        where: { id: req.user.id },
      },
    );

    await HistoriqueService.log({
      useer_id: req.user.id,
      action: "logout", // ✅ action correcte pour une déconnexion
      resource: "auth/deconnexion",
      resource_id: req.user.id,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
    });

    res.json({ message: "Déconnexion réussie" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Envoi du code de vérification
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Users.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    await user.update({
      code_verification: code,
      reset_code_expiry: Date.now() + 86400000,
      is_verified_for_reset: false,
    });

    await sendEmail(
      email,
      "Réinitialisation de mot de passe",
      `Votre code de vérification: ${code}`,
    );

    const token = jwt.sign(
      {
        id: user.id,
        purpose: "reset-password",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.json({ token, message: "Code envoyé par email" });
  } catch (err) {
    console.error("❌ Erreur forgotPassword:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Vérification du code et réinitialisation
exports.verifyAndReset = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { code } = req.body;

    if (!token) {
      return res.status(401).json({ message: "Token manquant" });
    }

    if (!code) {
      return res.status(400).json({ message: "Code de vérification requis" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({ message: "Token invalide ou expiré" });
    }

    if (decoded.purpose !== "reset-password") {
      return res.status(401).json({ message: "Token invalide" });
    }

    const user = await Users.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    if (!user.code_verification) {
      return res
        .status(400)
        .json({ message: "Aucun code de vérification trouvé" });
    }

    if (user.code_verification !== code) {
      return res.status(400).json({ message: "Code de vérification invalide" });
    }

    if (Date.now() > user.reset_code_expiry) {
      return res.status(400).json({ message: "Code expiré" });
    }

    user.is_verified_for_reset = true;
    await user.save();

    res.status(200).json({
      message:
        "Code vérifié. Vous pouvez maintenant changer votre mot de passe.",
      verified: true,
    });
  } catch (err) {
    console.error("❌ Erreur verifyAndReset:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Mise à jour du mot de passe après vérification
exports.updatePassword = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { newPassword } = req.body;

    if (!token) {
      return res.status(401).json({ message: "Token manquant" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Token invalide ou expiré" });
    }

    if (decoded.purpose !== "reset-password") {
      return res.status(401).json({ message: "Token invalide" });
    }

    const user = await Users.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    if (!user.is_verified_for_reset) {
      return res.status(403).json({
        message: "Accès refusé - Veuillez d'abord vérifier votre code",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.code_verification = null;
    user.reset_code_expiry = null;
    user.is_verified_for_reset = false;
    await user.save();

    // Supprimer tous les tokens de l'utilisateur après changement de mot de passe
    await Token.destroy({ where: { user_id: user.id } });

    res.status(200).json({ message: "Mot de passe mis à jour avec succès." });
  } catch (err) {
    console.error("❌ Erreur updatePassword:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Changer le mot de passe après connexion
exports.changerPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Les deux mots de passe sont requis",
      });
    }

    const user = await Users.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) {
      return res.status(400).json({ message: "Ancien mot de passe incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Supprimer tous les tokens sauf le courant (optionnel)
    await Token.destroy({
      where: {
        user_id: user.id,
        token: { [Op.ne]: req.headers.authorization?.split(" ")[1] },
      },
    });

    res.json({ message: "Mot de passe modifié avec succès." });
  } catch (err) {
    console.error("❌ Erreur changerPassword:", err);
    res.status(500).json({ error: err.message });
  }
};
