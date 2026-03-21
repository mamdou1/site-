module.exports = (sequelize, DataTypes) => {
  const Video = sequelize.define(
    "Video",
    {
      titre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isUrl: true,
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      thumbnail: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("PRESENTATION", "MARKETING", "DEMO", "TUTORIEL"),
        allowNull: false,
        defaultValue: "PRESENTATION",
      },
      enterprise_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "entreprises",
          key: "id",
        },
      },
    },
    {
      tableName: "videos",
      underscored: true,
      timestamps: true,
    },
  );

  Video.associate = (models) => {
    Video.belongsTo(models.Enterprise, {
      foreignKey: "enterprise_id",
      as: "enterprise",
    });

    Video.belongsTo(models.Service, {
      foreignKey: "service_id",
      as: "services",
    });
  };

  return Video;
};
