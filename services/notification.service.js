// services/notification.service.js
const { Notifications } = require("../models");

class NotificationService {
  /**
   * Créer une notification pour un utilisateur spécifique
   */
  static async notifyUser(userId, type, title, message, metadata = {}) {
    try {
      const notification = await Notifications.create({
        user_id: userId,
        type,
        title,
        message,
        metadata,
        lue: false,
        date: new Date()
      });
      return notification;
    } catch (error) {
      console.error("Erreur notification utilisateur:", error);
      return null;
    }
  }

  /**
   * Créer une notification sans utilisateur spécifique (notification générale)
   */
  static async notify(type, title, message, metadata = {}) {
    try {
      const notification = await Notifications.create({
        type,
        title,
        message,
        metadata,
        lue: false,
        date: new Date()
      });
      return notification;
    } catch (error) {
      console.error("Erreur notification:", error);
      return null;
    }
  }
}

module.exports = NotificationService;