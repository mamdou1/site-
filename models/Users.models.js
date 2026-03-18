module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define(
    "Users",
    {
      nom: {
        type: DataTypes.STRING,
        allowNull: false
      },
      prenom: {
        type: DataTypes.STRING,
        allowNull: false
      },
      nombre_visite: {
        type: DataTypes.INTEGER, // Correction: NUMBER -> INTEGER
        defaultValue: 0
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      telephone: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM("ADMIN", "VISITEUR", "SUPER_ADMIN"),
        defaultValue: "VISITEUR"
      },
      code_verification: DataTypes.STRING,
      reset_code_expiry: DataTypes.DATE,
      is_verified_for_reset: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      photo_profil: {
        type: DataTypes.STRING,
        defaultValue: "",
      },
    },
    {
      tableName: "users",
      underscored: true,
      timestamps: true, 
    }
  );

  Users.associate = (models) => {
    Users.hasMany(models.Contact, {
      foreignKey: 'user_id',
      as: 'contacts'
    });
    
    Users.hasMany(models.Notifications, {
      foreignKey: 'user_id',
      as: 'notifications'
    });
  };

  return Users;
};