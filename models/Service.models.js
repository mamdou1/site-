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
        allowNull: false,
      },
      prix: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      duree: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "Durée en jours",
      },
      technologie: {
        type: DataTypes.TEXT,
        allowNull: false,
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
