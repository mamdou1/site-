module.exports = (sequelize, DataTypes) => {
  const Enterprise = sequelize.define(
    "Enterprise",
    {
      nom: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sigle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slogan: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      telephone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      adresse: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      localisation: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
    },
    {
      tableName: "entreprises",
      underscored: true,
      timestamps: true,
    },
  );

  Enterprise.associate = (models) => {
    Enterprise.hasMany(models.Video, {
      foreignKey: "enterprise_id",
      as: "videos",
    });

    Enterprise.hasMany(models.Solution, {
      foreignKey: "enterprise_id",
      as: "solutions",
    });

    Enterprise.hasMany(models.Notifications, {
      foreignKey: "enterprise_id",
      as: "notifications",
    });
  };

  return Enterprise;
};
