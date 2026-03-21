module.exports = (sequelize, DataTypes) => {
  const Contact = sequelize.define(
    "Contact",
    {
      nom_complet: DataTypes.STRING,
      societe: DataTypes.STRING,
      telephone: DataTypes.STRING,
      email: DataTypes.STRING,
      message: DataTypes.TEXT,
      fonction: DataTypes.STRING,
      objet: DataTypes.STRING,
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
    },
    {
      tableName: "contacts",
      timestamps: true,
    },
  );

  Contact.associate = (models) => {
    Contact.hasMany(models.Notifications, {
      as: "notifications",
      foreignKey: "contact_id",
    });
  };
  return Contact;
};
