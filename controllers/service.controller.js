// controllers/service.controller.js
const { Service, Solution, Enterprise, Video } = require("../models");
const { Op } = require("sequelize");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");
const NotificationService = require("../services/notification.service");

/**
 * Créer un service
 */
exports.create = async (req, res) => {
  try {
    const { nom, description, image, prix, duree, technologie, solutionIds } =
      req.body;

    // Vérifier si un service avec le même nom existe déjà
    const existingService = await Service.findOne({
      where: {
        nom,
      },
    });

    if (existingService) {
      return res.status(400).json({
        message: "Un service avec ce nom existe déjà pour cette entreprise",
      });
    }

    const service = await Service.create({
      nom,
      description,
      image,
      prix,
      duree,
      technologie,
    });

    // Associer les solutions si fournies
    if (solutionIds && solutionIds.length > 0) {
      await service.setSolutions(solutionIds);
    }

    // Notification à l'entreprise
    await NotificationService.notifyUser(
      enterprise_id,
      "success",
      "Nouveau service ajouté",
      `Le service "${nom}" a été ajouté à votre catalogue.`,
      { serviceId: service.id, prix, duree },
    );

    await HistoriqueService.logCreate(req, "service", service);

    const serviceWithSolutions = await Service.findByPk(service.id, {
      include: [
        {
          model: Solution,
          as: "solutions",
          through: { attributes: [] },
          attributes: ["id", "titre", "description"],
        },
      ],
    });

    res.status(201).json({
      message: "Service créé avec succès",
      service: serviceWithSolutions,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Récupérer tous les services
 */
exports.findAll = async (req, res) => {
  try {
    const { limit = 10, offset = 0, search, minPrix, maxPrix } = req.query;

    let where = {};

    if (search) {
      where = {
        [Op.or]: [
          { nom: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
          { technologie: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    if (minPrix) {
      where.prix = { [Op.gte]: parseFloat(minPrix) };
    }

    if (maxPrix) {
      where.prix = { ...where.prix, [Op.lte]: parseFloat(maxPrix) };
    }

    const services = await Service.findAndCountAll({
      where,
      include: [
        {
          model: Solution,
          as: "solutions",
          through: { attributes: [] },
          attributes: ["id", "titre"],
          required: false,
        },
        {
          model: Video,
          as: "videos",
          through: { attributes: [] },
          attributes: ["id", "titre", "type"],
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
        resource: "service",
        resource_id: null,
        resource_identifier: "liste des services",
        description: "Consultation de la liste des services",
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
      total: services.count,
      limit: parseInt(limit),
      offset: parseInt(offset),
      data: services.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Récupérer un service par ID
 */
exports.findById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id, {
      include: [
        {
          model: Solution,
          as: "solutions",
          through: { attributes: [] },
          attributes: ["id", "titre", "description", "image"],
        },
        {
          model: Video,
          as: "videos",
          through: { attributes: [] },
          attributes: ["id", "titre", "url", "type", "thumbnail"],
        },
      ],
    });

    await HistoriqueService.log({
      user_id: req.user?.id || null,
      action: "read",
      resource: "service",
      resource_id: data.id,
      resource_identifier: `Service #${data.id}`,
      description: `Consultation du service #${data.id}`,
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

    if (!service) {
      return res.status(404).json({ message: "Service non trouvé" });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Mettre à jour un service
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description, image, prix, duree, technologie, solutionIds } =
      req.body;

    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ message: "Service non trouvé" });
    }

    // Vérifier si un autre service avec le même nom existe
    if (nom && nom !== service.nom) {
      const existingService = await Service.findOne({
        where: {
          nom,
          id: { [Op.ne]: id },
        },
      });

      if (existingService) {
        return res.status(400).json({
          message: "Un service avec ce nom existe déjà pour cette entreprise",
        });
      }
    }

    await service.update({
      nom: nom || service.nom,
      description: description || service.description,
      image: image || service.image,
      prix: prix || service.prix,
      duree: duree || service.duree,
      technologie: technologie || service.technologie,
    });

    // Mettre à jour les solutions associées
    if (solutionIds) {
      await service.setSolutions(solutionIds);
    }

    // Notification à l'entreprise
    await NotificationService.notifyUser(
      req.user.id,
      "info",
      "Service mis à jour",
      `Le service "${service.nom}" a été mis à jour.`,
      { serviceId: service.id },
    );

    const updatedService = await Service.findByPk(id, {
      include: [
        {
          model: Solution,
          as: "solutions",
          through: { attributes: [] },
          attributes: ["id", "titre"],
        },
      ],
    });

    await HistoriqueService.logUpdate(req, "serice", service, updatedService);

    res.json({
      message: "Service mis à jour avec succès",
      service: updatedService,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Supprimer un service
 */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id, {
      include: [
        {
          model: Solution,
          as: "solutions",
        },
        {
          model: Video,
          as: "videos",
        },
      ],
    });

    if (!service) {
      return res.status(404).json({ message: "Service non trouvé" });
    }

    // Vérifier si des vidéos sont associées
    if (service.videos && service.videos.length > 0) {
      return res.status(400).json({
        message:
          "Impossible de supprimer ce service car il est associé à des vidéos",
        videosCount: service.videos.length,
      });
    }

    const serviceName = service.nom;
    const enterpriseId = service.enterprise_id;

    await service.destroy();

    // Notification à l'entreprise
    await NotificationService.notifyUser(
      req.user.id,
      "warning",
      "Service supprimé",
      `Le service "${serviceName}" a été supprimé.`,
      { serviceId: id },
    );

    await HistoriqueService.logDelete(req, "service", service);

    res.json({
      message: "Service supprimé avec succès",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Récupérer les vidéos d'un service
 */
exports.getVideos = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ message: "Service non trouvé" });
    }

    const videos = await service.getVideos({
      attributes: ["id", "titre", "url", "type", "thumbnail"],
    });

    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
