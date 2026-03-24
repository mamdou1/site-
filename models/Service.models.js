module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define(
    "Service",
    {
      nom: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      prix: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      duree: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Durée en jours",
      },
      technologie: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "services",
      underscored: true,
      timestamps: true,
    },
  );

  Service.associate = (models) => {
    Service.belongsToMany(models.Solution, {
      through: models.ServiceSolution,
      foreignKey: "service_id",
      otherKey: "solution_id",
      as: "solutions",
    });

    Service.hasMany(models.Video, {
      foreignKey: "service_id",
      as: "videos",
    });
  };

  return Service;
};
