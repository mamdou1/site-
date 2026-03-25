// controllers/site.controller.js
const { Site, Salle } = require("../models");
const NotificationService = require("../services/notification.service");

/**
 * Créer un nouveau site
 */
exports.create = async (req, res) => {
  try {
    const data = await Site.create(req.body);
    //(notifyuser) recupère l'tilisateur de la base de donnée (nous)

    await NotificationService.notifyUser(
      user.id,
      "success",
      "Bienvenue sur la plateforme",
      `Bonjour ${nom}, votre compte a été créé avec succès.`,
      { registrationDate: new Date() },
    );

    //Et (notify) ne récupère aucun utilisatieur

    await NotificationService.notifyUser(
      "success",
      "Bienvenue sur la plateforme",
      `Bonjour ${nom}, votre compte a été créé avec succès.`,
      { registrationDate: new Date() },
    );
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la création du site",
      error: error.message,
    });
  }
};

/**
 * Récupérer tous les sites
 */
exports.findAll = async (req, res) => {
  try {
    const data = await Site.findAll({
      include: [
        {
          model: Salle,
          as: "salles",
          required: false,
          attributes: ["id", "libelle", "code_salle"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des sites",
      error: error.message,
    });
  }
};

/**
 * Récupérer un site par son ID
 */
exports.findById = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await Site.findByPk(id, {
      include: [
        {
          model: Salle,
          as: "salles",
          required: false,
          attributes: ["id", "libelle", "code_salle"],
        },
      ],
    });

    if (!data) {
      return res.status(404).json({ message: "Site non trouvé" });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du site",
      error: error.message,
    });
  }
};

/**
 * Mettre à jour un site
 */
exports.update = async (req, res) => {
  const { id } = req.params;

  try {
    const site = await Site.findByPk(id);
    if (!site) {
      return res.status(404).json({ message: "Site non trouvé" });
    }

    await Site.update(req.body, { where: { id } });
    const updatedSite = await Site.findByPk(id);

    res.json({
      success: true,
      message: "Site mis à jour avec succès",
      data: updatedSite,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour du site",
      error: error.message,
    });
  }
};

/**
 * Supprimer un site
 */
exports.delete = async (req, res) => {
  const { id } = req.params;

  try {
    const site = await Site.findByPk(id);
    if (!site) {
      return res.status(404).json({ message: "Site non trouvé" });
    }

    // Vérifier s'il y a des salles associées
    const salles = await Salle.findAll({ where: { site_id: id } });
    if (salles.length > 0) {
      return res.status(400).json({
        message: "Impossible de supprimer ce site car il contient des salles",
        count: salles.length,
      });
    }

    await site.destroy();

    res.json({
      success: true,
      message: "Site supprimé avec succès",
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression du site",
      error: error.message,
    });
  }
};

/**
 * Récupérer toutes les salles d'un site
 */
exports.getAllSalleBySite = async (req, res) => {
  const { id } = req.params;

  try {
    const site = await Site.findByPk(id);
    if (!site) {
      return res.status(404).json({ message: "Site non trouvé" });
    }

    const data = await Salle.findAll({
      where: { site_id: id },
      order: [["libelle", "ASC"]],
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des salles",
      error: error.message,
    });
  }
};
