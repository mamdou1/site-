const { HistoriqueLog } = require("../models");
const logger = require("../config/logger.config");

class HistoriqueService {
  static async log(payload) {
    try {
      console.log("🔵 1. HistoriqueService.log appelé avec:", payload);

      // ✅ 1. Écrire dans Winston (fichiers)
      logger.info("HISTORIQUE", payload);
      console.log("🟡 1.5 Log envoyé à Winston");

      // ✅ 2. Écrire dans la base de données
      console.log("🟡 2. Tentative création en base...");
      const savedLog = await HistoriqueLog.create(payload);
      console.log("🟢 2. Log sauvegardé en base, ID:", savedLog.id);

      return savedLog;
    } catch (err) {
      console.error("🔴 3. ERREUR HistoriqueLog:", err.message);
      console.error("🔴 Stack:", err.stack);
      console.error("🔴 Payload incriminé:", JSON.stringify(payload, null, 2));

      // Tentative de secours : au moins dans Winston
      logger.error("Échec sauvegarde base de données", {
        error: err.message,
        payload,
      });

      return null;
    }
  }

  static formatIdentifier(item, field = null) {
    if (!item) return "inconnu";
    if (field)
      return item[field] ? `${item[field]} (${item.id})` : `#${item.id}`;

    const possibleFields = [
      "libelle",
      "nom",
      "prenom",
      "code",
      "titre",
      "username",
      "email",
    ];

    for (const f of possibleFields) {
      if (item[f]) {
        if (f === "prenom" && item.nom)
          return `${item.prenom} ${item.nom} (${item.id})`;
        return `${item[f]} (${item.id})`;
      }
    }
    return `#${item.id}`;
  }

  /**
   * Nettoie un objet Sequelize pour éviter les références circulaires
   */
  static cleanSequelizeObject(obj) {
    if (!obj) return null;

    // Si c'est une instance Sequelize, utiliser toJSON()
    if (obj && typeof obj.toJSON === "function") {
      return obj.toJSON();
    }

    // Si c'est un objet simple, le retourner tel quel
    return obj;
  }

  static getChanges(oldObj, newObj) {
    if (!oldObj || !newObj) return []; // ← Retourner un tableau vide

    const cleanOld = this.cleanSequelizeObject(oldObj);
    const cleanNew = this.cleanSequelizeObject(newObj);

    const changes = [];
    const excludedFields = [
      "id",
      "createdAt",
      "updatedAt",
      "created_at",
      "updated_at",
      "deletedAt",
      "deleted_at",
      "password",
    ];

    // Comparer les propriétés simples
    for (const key in cleanNew) {
      if (excludedFields.includes(key)) continue;

      const oldVal = cleanOld[key];
      const newVal = cleanNew[key];

      // Ignorer les objets (sauf si c'est le tableau 'values')
      if (key === "values" && Array.isArray(oldVal) && Array.isArray(newVal)) {
        // Traitement spécial pour les valeurs des métadonnées
        const oldValuesMap = new Map(
          oldVal.map((v) => [v.meta_field_id, v.value]),
        );
        const newValuesMap = new Map(
          newVal.map((v) => [v.meta_field_id, v.value]),
        );

        for (const [fieldId, newValue] of newValuesMap) {
          const oldValue = oldValuesMap.get(fieldId);
          if (String(oldValue) !== String(newValue)) {
            changes.push(
              `meta_field_${fieldId}: ${oldValue || "null"} → ${newValue || "null"}`,
            );
          }
        }
      } else if (oldVal && typeof oldVal === "object") continue;
      else if (newVal && typeof newVal === "object") continue;
      else if (String(oldVal) !== String(newVal)) {
        changes.push(`${key}: ${oldVal || "null"} → ${newVal || "null"}`);
      }
    }

    return changes; // ← Toujours un tableau (vide si pas de changements)
  }

  static async logCreate(req, resource, newItem, identifierField = null) {
    const cleanItem = this.cleanSequelizeObject(newItem);
    const identifier = this.formatIdentifier(cleanItem, identifierField);
    const description = `Création de ${resource} : ${identifier}`;

    return this.log({
      user_id: req.user?.id || null,
      action: "create",
      resource,
      resource_id: cleanItem.id,
      resource_identifier: identifier,
      description,
      method: req.method,
      path: req.originalUrl,
      status: 201,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      new_data: cleanItem,
    });
  }

  static async logUpdate(
    req,
    resource,
    oldItem,
    newItem,
    identifierField = null,
  ) {
    const cleanOld = this.cleanSequelizeObject(oldItem);
    const cleanNew = this.cleanSequelizeObject(newItem);

    const identifier = this.formatIdentifier(cleanNew, identifierField);
    const changes = this.getChanges(cleanOld, cleanNew);
    const changesText =
      changes.length > 0 ? changes.join(", ") : "aucun changement";
    const description = `Modification de ${resource} : ${identifier} - ${changesText}`;

    return this.log({
      user_id: req.user?.id || null,
      action: "update",
      resource,
      resource_id: cleanNew.id,
      resource_identifier: identifier,
      description,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      old_data: cleanOld,
      new_data: cleanNew,
    });
  }

  static async logDelete(req, resource, deletedItem, identifierField = null) {
    const cleanItem = this.cleanSequelizeObject(deletedItem);
    const identifier = this.formatIdentifier(cleanItem, identifierField);
    const description = `Suppression de ${resource} : ${identifier}`;

    return this.log({
      user_id: req.user?.id || null,
      action: "delete",
      resource,
      resource_id: cleanItem.id,
      resource_identifier: identifier,
      description,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      deleted_data: cleanItem,
    });
  }
}

module.exports = HistoriqueService;
