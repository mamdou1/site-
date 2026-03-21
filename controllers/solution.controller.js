const { Solution, Service, Enterprise } = require("../models");
const { Op } = require("sequelize");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");
const NotificationService = require("../services/notification.service");

/**
 * Créer une solution
 */
exports.create = async (req, res) => {
  try {
    const { titre, description, image, enterprise_id, serviceIds } = req.body;

    // Vérifier si l'entreprise existe
    const enterprise = await Enterprise.findByPk(enterprise_id);
    if (!enterprise) {
      return res.status(404).json({ message: "Entreprise non trouvée" });
    }

    // Vérifier si une solution avec le même titre existe déjà pour cette entreprise
    const existingSolution = await Solution.findOne({
      where: {
        titre,
        enterprise_id,
      },
    });

    if (existingSolution) {
      return res.status(400).json({
        message: "Une solution avec ce titre existe déjà pour cette entreprise",
      });
    }

    const solution = await Solution.create({
      titre,
      description,
      image,
      enterprise_id,
    });

    // Notification à l'entreprise
    await NotificationService.notifyUser(
      req.user?.id,
      "success",
      "Nouvelle solution ajoutée",
      `La solution "${titre}" a été ajoutée à votre catalogue.`,
      { solutionId: solution.id },
    );

    await HistoriqueService.logCreate(req, "solution", solution);

    const solutionWithServices = await Solution.findByPk(solution.id, {
      include: [
        {
          model: Enterprise,
          as: "enterprise",
          attributes: ["id", "nom", "sigle", "email"],
        },
      ],
    });

    res.status(201).json({
      message: "Solution créée avec succès",
      solution: solutionWithServices,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Récupérer toutes les solutions
 */
exports.findAll = async (req, res) => {
  try {
    const { limit = 10, offset = 0, search, enterprise_id } = req.query;

    let where = {};

    if (search) {
      where = {
        [Op.or]: [
          { titre: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    if (enterprise_id) {
      where.enterprise_id = parseInt(enterprise_id);
    }

    const solutions = await Solution.findAndCountAll({
      where,
      include: [
        {
          model: Service,
          as: "services",
          through: { attributes: [] },
          attributes: ["id", "nom", "prix"],
          required: false,
        },
        {
          model: Enterprise,
          as: "enterprise",
          attributes: ["id", "nom", "sigle", "email", "localisation"],
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
        resource: "solution",
        resource_id: null,
        resource_identifier: "liste des solutions",
        description: "Consultation de la liste des soluttions",
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
      total: solutions.count,
      limit: parseInt(limit),
      offset: parseInt(offset),
      data: solutions.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Récupérer une solution par ID
 */
exports.findById = async (req, res) => {
  try {
    const { id } = req.params;

    const solution = await Solution.findByPk(id, {
      include: [
        {
          model: Service,
          as: "services",
          through: { attributes: [] },
          attributes: [
            "id",
            "nom",
            "description",
            "prix",
            "duree",
            "technologie",
          ],
        },
        {
          model: Enterprise,
          as: "enterprise",
          attributes: [
            "id",
            "nom",
            "sigle",
            "email",
            "telephone",
            "adresse",
            "localisation",
          ],
        },
      ],
    });

    await HistoriqueService.log({
      user_id: req.user?.id || null,
      action: "read",
      resource: "solution",
      resource_id: data.id,
      resource_identifier: `Solution #${data.id}`,
      description: `Consultation du solution #${data.id}`,
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

    if (!solution) {
      return res.status(404).json({ message: "Solution non trouvée" });
    }

    res.json(solution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Mettre à jour une solution
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, description, image, serviceIds } = req.body;

    const solution = await Solution.findByPk(id);
    if (!solution) {
      return res.status(404).json({ message: "Solution non trouvée" });
    }

    // Vérifier si une autre solution avec le même titre existe
    if (titre && titre !== solution.titre) {
      const existingSolution = await Solution.findOne({
        where: {
          titre,
          enterprise_id: solution.enterprise_id,
          id: { [Op.ne]: id },
        },
      });

      if (existingSolution) {
        return res.status(400).json({
          message:
            "Une solution avec ce titre existe déjà pour cette entreprise",
        });
      }
    }

    await solution.update({
      titre: titre || solution.titre,
      description: description || solution.description,
      image: image || solution.image,
    });

    // Mettre à jour les services associés
    if (serviceIds) {
      await solution.setServices(serviceIds);
    }

    // Notification à l'entreprise
    await NotificationService.notifyUser(
      req.user?.id,
      "info",
      "Solution mise à jour",
      `La solution "${solution.titre}" a été mise à jour.`,
      { solutionId: solution.id },
    );

    const updatedSolution = await Solution.findByPk(id, {
      include: [
        {
          model: Service,
          as: "services",
          through: { attributes: [] },
          attributes: ["id", "nom"],
        },
      ],
    });

    await HistoriqueService.logUpdate(
      req,
      "solution",
      solution,
      updatedSolution,
    );

    res.json({
      message: "Solution mise à jour avec succès",
      solution: updatedSolution,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Supprimer une solution
 */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const solution = await Solution.findByPk(id, {
      include: [
        {
          model: Service,
          as: "services",
        },
      ],
    });

    if (!solution) {
      return res.status(404).json({ message: "Solution non trouvée" });
    }

    // Vérifier si des services sont associés
    if (solution.services && solution.services.length > 0) {
      return res.status(400).json({
        message:
          "Impossible de supprimer cette solution car elle est associée à des services",
        servicesCount: solution.services.length,
      });
    }

    const solutionTitle = solution.titre;
    const enterpriseId = solution.enterprise_id;

    await solution.destroy();

    // Notification à l'entreprise
    await NotificationService.notifyUser(
      req.user?.id,
      "warning",
      "Solution supprimée",
      `La solution "${solutionTitle}" a été supprimée.`,
      { solutionId: id },
    );

    await HistoriqueService.logDelete(req, "solution", solution);

    res.json({
      message: "Solution supprimée avec succès",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
