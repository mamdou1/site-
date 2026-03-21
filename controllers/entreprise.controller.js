// controllers/entreprise.controller.js
const {
  Enterprise,
  Service,
  Video,
  Solution,
  Temoignage,
  Contact,
  Users,
} = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");
const NotificationService = require("../services/notification.service");

/**
 * Créer une nouvelle entreprise
 */
exports.create = async (req, res) => {
  try {
    const {
      nom,
      sigle,
      slogan,
      description,
      email,
      telephone,
      adresse,
      localisation,
      created_by,
    } = req.body;

    // Vérifier si l'entreprise existe déjà
    const existingEnterprise = await Enterprise.findOne({
      where: {
        [Op.or]: [{ email }, { telephone }],
      },
    });

    if (existingEnterprise) {
      return res.status(400).json({
        message: "Une entreprise avec cet email ou ce téléphone existe déjà",
      });
    }

    const enterprise = await Enterprise.create({
      nom,
      sigle,
      slogan,
      description,
      email,
      telephone,
      adresse,
      localisation,
      created_by: created_by || req.user?.id,
      updated_by: created_by || req.user?.id,
    });

    await NotificationService.notifyUser(
      req.user?.id,
      "success",
      "création de l'entreprise",
      `L'entreprise ${nom},a été créé avec succès.`,
      { registrationDate: new Date() },
    );

    // Journalisation dans l'historique
    await HistoriqueService.logCreate(req, "entreprise", enterprise);

    res.status(201).json({
      message: "Entreprise créée avec succès",
      enterprise,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Récupérer toutes les entreprises
 */
exports.findAll = async (req, res) => {
  try {
    const { limit = 10, offset = 0, search } = req.query;

    let where = {};
    if (search) {
      where = {
        [Op.or]: [
          { nom: { [Op.like]: `%${search}%` } },
          { sigle: { [Op.like]: `%${search}%` } },
          { slogan: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { localisation: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    const enterprises = await Enterprise.findAndCountAll({
      where,
      include: [
        {
          model: Video,
          as: "videos",
          attributes: ["id", "titre", "type"],
          required: false,
        },
        {
          model: Solution,
          as: "solutions",
          attributes: ["id", "titre"],
          required: false,
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    // Journalisation dans l'historique pour les GET avec sidebar
    if (req.headers["x-sidebar-navigation"] === "true") {
      await HistoriqueService.log({
        user_id: req.user?.id || null,
        action: "read",
        resource: "entreprise",
        resource_id: null,
        resource_identifier: "liste des entreprises",
        description: "Consultation de la liste des entreprises",
        method: req.method,
        path: req.originalUrl,
        status: 200,
        ip: req.ip,
        user_agent: req.headers["user-agent"],
        data: {
          count: users.length,
          duration: Date.now() - startTime,
        },
      });
    }

    res.json({
      total: enterprises.count,
      limit: parseInt(limit),
      offset: parseInt(offset),
      data: enterprises.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Récupérer une entreprise par ID
 */
exports.findById = async (req, res) => {
  try {
    const { id } = req.params;

    const enterprise = await Enterprise.findByPk(id, {
      include: [
        {
          model: Video,
          as: "videos",
          required: false,
        },
        {
          model: Solution,
          as: "solutions",
          required: false,
        },
        {
          model: Users,
          as: "creator",
          attributes: ["id", "nom", "prenom", "email"],
          foreignKey: "created_by",
          required: false,
        },
        {
          model: Users,
          as: "updater",
          attributes: ["id", "nom", "prenom", "email"],
          foreignKey: "updated_by",
          required: false,
        },
      ],
    });

    await HistoriqueService.log({
      user_id: req.user?.id || null,
      action: "read",
      resource: "entreprise",
      resource_id: enterprise.id,
      resource_identifier: `Entreprise #${enterprise.id}`,
      description: `Consultation du entreprise #${enterprise.id}`,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      data: {
        duration: Date.now() - startTime,
        params: req.params,
      },
    });

    if (!enterprise) {
      return res.status(404).json({ message: "Entreprise non trouvée" });
    }

    res.json(enterprise);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Mettre à jour une entreprise
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.user?.id,
    };

    const enterprise = await Enterprise.findByPk(id);
    if (!enterprise) {
      return res.status(404).json({ message: "Entreprise non trouvée" });
    }

    // Vérifier si l'email ou téléphone existe déjà pour une autre entreprise
    if (updateData.email && updateData.email !== enterprise.email) {
      const existing = await Enterprise.findOne({
        where: { email: updateData.email },
      });
      if (existing) {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }
    }

    if (updateData.telephone && updateData.telephone !== enterprise.telephone) {
      const existing = await Enterprise.findOne({
        where: { telephone: updateData.telephone },
      });
      if (existing) {
        return res
          .status(400)
          .json({ message: "Ce téléphone est déjà utilisé" });
      }
    }

    await enterprise.update(updateData);

    await NotificationService.notifyUser(
      req.user.id,
      "info",
      "entreprise mis à jour",
      `L' entreprise "${enterprise.nom}" a été mis à jour.`,
      { entrepriseId: enterprise.id },
    );

    const updatedEnterprise = await Enterprise.findByPk(id, {
      include: [
        {
          model: Users,
          as: "creator",
          attributes: ["id", "nom", "prenom", "email"],
          required: false,
        },
        {
          model: Users,
          as: "updater",
          attributes: ["id", "nom", "prenom", "email"],
          required: false,
        },
      ],
    });

    await HistoriqueService.logUpdate(
      req,
      "entreprise",
      enterprise,
      updatedEnterprise,
    );

    res.json({
      message: "Entreprise mise à jour avec succès",
      enterprise: updatedEnterprise,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Supprimer une entreprise
 */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const enterprise = await Enterprise.findByPk(id);
    if (!enterprise) {
      return res.status(404).json({ message: "Entreprise non trouvée" });
    }

    // Vérifier s'il y a des services ou vidéos associés
    const videos = await Video.count({ where: { enterprise_id: id } });
    const solutions = await Solution.count({ where: { enterprise_id: id } });
    const entrepriseName = enterprise.nom;

    if (videos > 0 || solutions > 0) {
      return res.status(400).json({
        message:
          "Impossible de supprimer cette entreprise car elle a des données associées",
        videos,
        solutions,
      });
    }

    await enterprise.destroy();

    await NotificationService.notifyUser(
      req.user.id,
      "warning",
      "entreprise supprimé",
      `L' entreprise "${entrepriseName}" a été supprimé.`,
      { entrepriseId: id },
    );

    await HistoriqueService.logDelete(req, "entreprise", enterprise);

    res.json({
      message: "Entreprise supprimée avec succès",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Récupérer toutes les vidéos d'une entreprise
 */
exports.getVideos = async (req, res) => {
  try {
    const { id } = req.params;

    const enterprise = await Enterprise.findByPk(id);
    if (!enterprise) {
      return res.status(404).json({ message: "Entreprise non trouvée" });
    }

    const videos = await Video.findAll({
      where: { enterprise_id: id },
      include: [
        {
          model: Service,
          as: "services",
          through: { attributes: [] },
          attributes: ["id", "nom"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Ajouter une vidéo à une entreprise
 */
exports.addVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, description, type, serviceIds } = req.body;

    const videoUrl = req.file ? `/uploads/videos/${req.file.filename}` : null;

    if (!videoUrl) {
      return res.status(400).json({ message: "Vidéo requise" });
    }

    const enterprise = await Enterprise.findByPk(id);
    if (!enterprise) {
      return res.status(404).json({ message: "Entreprise non trouvée" });
    }

    const video = await Video.create({
      titre,
      description,
      url: videoUrl,
      type: type || "PRESENTATION",
      thumbnail: req.body.thumbnail || "",
      enterprise_id: id,
    });

    if (serviceIds && serviceIds.length > 0) {
      await video.setServices(serviceIds);
    }

    const videoWithServices = await Video.findByPk(video.id, {
      include: [
        {
          model: Service,
          as: "services",
          through: { attributes: [] },
        },
      ],
    });

    res.status(201).json({
      message: "Vidéo ajoutée avec succès",
      video: videoWithServices,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
