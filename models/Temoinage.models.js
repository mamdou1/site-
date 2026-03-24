module.exports = (sequelize, DataTypes) => {
  const Temoignage = sequelize.define(
    "Temoignage",
    {
      poste: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      photo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      statut: {
        type: DataTypes.ENUM("EN_ATTENTE", "VALIDER", "REJETTER"),
        allowNull: false,
        defaultValue: "EN_ATTENTE",
      },
      service_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "services",
          key: "id",
        },
      },
    },
    {
      tableName: "temoignages",
      underscored: true,
      timestamps: true,
    },
  );

  Temoignage.associate = (models) => {
    Temoignage.belongsTo(models.Service, {
      foreignKey: "service_id",
      as: "service",
    });

    Temoignage.hasMany(models.Notifications, {
      foreignKey: "temoignage_id",
      as: "notifications",
    });
  };

  return Temoignage;
};
