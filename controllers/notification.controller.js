// controllers/notification.controller.js
const {
  Notifications,
  Users,
  Contact,
  Enterprise,
  Temoignage,
} = require("../models");
const { Op } = require("sequelize");
const logger = require("../config/logger.config");

exports.createNotification = async (data) => {
  try {
    const notification = await Notifications.create({
      user_id: data.user_id || null,
      contact_id: data.contact_id || null,
      enterprise_id: data.enterprise_id || null,
      temoignage_id: data.temoignage_id || null,
      type: data.type || "info",
      message: data.message,
      title: data.title || "Notification",
      metadata: data.metadata || {},
      lue: false,
      date: new Date(),
    });

    return notification;
  } catch (error) {
    console.error("Erreur création notification:", error);
    throw error;
  }
};

/**
 * Récupérer toutes les notifications d'un utilisateur
 */
exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0, unreadOnly = false } = req.query;

    let where = { user_id: userId };
    if (unreadOnly === "true") {
      where.lue = false;
    }

    const notifications = await Notifications.findAndCountAll({
      where,
      include: [
        {
          model: Contact,
          as: "contact",
          attributes: ["id", "nom_complet", "email"],
          required: false,
        },
        {
          model: Enterprise,
          as: "enterprise",
          attributes: ["id", "nom", "sigle", "email"],
          required: false,
        },
        {
          model: Temoignage,
          as: "temoignage",
          attributes: ["id", "poste", "message"],
          required: false,
        },
      ],
      order: [["date", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Compter les notifications non lues
    const unreadCount = await Notifications.count({
      where: { user_id: userId, lue: false },
    });

    res.json({
      total: notifications.count,
      unreadCount,
      limit: parseInt(limit),
      offset: parseInt(offset),
      data: notifications.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Récupérer toutes les notifications d'une entreprise
 */
exports.getEnterpriseNotifications = async (req, res) => {
  try {
    const { enterpriseId } = req.params;
    const { limit = 20, offset = 0, unreadOnly = false } = req.query;

    let where = { enterprise_id: enterpriseId };
    if (unreadOnly === "true") {
      where.lue = false;
    }

    const notifications = await Notifications.findAndCountAll({
      where,
      include: [
        {
          model: Users,
          as: "user",
          attributes: ["id", "nom", "prenom", "email"],
          required: false,
        },
        {
          model: Contact,
          as: "contact",
          attributes: ["id", "nom_complet", "email"],
          required: false,
        },
      ],
      order: [["date", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const unreadCount = await Notifications.count({
      where: { enterprise_id: enterpriseId, lue: false },
    });

    res.json({
      total: notifications.count,
      unreadCount,
      limit: parseInt(limit),
      offset: parseInt(offset),
      data: notifications.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Marquer une notification comme lue
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notifications.findByPk(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification non trouvée" });
    }

    await notification.update({ lue: true });

    res.json({
      message: "Notification marquée comme lue",
      notification,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Marquer toutes les notifications d'un utilisateur comme lues
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    await Notifications.update(
      { lue: true },
      { where: { user_id: userId, lue: false } },
    );

    res.json({
      message: "Toutes les notifications ont été marquées comme lues",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Supprimer une notification
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notifications.findByPk(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification non trouvée" });
    }

    await notification.destroy();

    res.json({ message: "Notification supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Récupérer le nombre de notifications non lues
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const count = await Notifications.count({
      where: { user_id: userId, lue: false },
    });

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
