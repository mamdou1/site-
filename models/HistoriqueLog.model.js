// models/HistoriqueLog.model.js
module.exports = (sequelize, DataTypes) => {
  const HistoriqueLog = sequelize.define(
    "HistoriqueLog",
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      action: {
        type: DataTypes.STRING, // create, read, update, delete, login, upload...
        allowNull: false,
      },

      resource: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      resource_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      //  NOUVEAU : Identifiant unique de l'élément (pour les suppressions)
      resource_identifier: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      //  NOUVEAU : Description textuelle de ce qui a été modifié
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      method: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      path: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      ip: {
        type: DataTypes.STRING,
      },

      user_agent: {
        type: DataTypes.TEXT,
      },

      //  NOUVEAU : Données avant modification (pour UPDATE)
      old_data: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      //  NOUVEAU : Données après modification (pour UPDATE)
      new_data: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      //  NOUVEAU : Données supprimées (pour DELETE)
      deleted_data: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      // Données additionnelles (conservé pour compatibilité)
      data: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      tableName: "historiqueLog",
      timestamps: true,
      underscored: true,
    },
  );

  HistoriqueLog.associate = (models) => {
    HistoriqueLog.belongsTo(models.Users, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return HistoriqueLog;
};
