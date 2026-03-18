module.exports = (sequelize, DataTypes) => {
  const Enterprise = sequelize.define('Enterprise', {
    nom: {
      type: DataTypes.STRING,
      allowNull: false
    },
    prenom: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    telephone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nombre_visite: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    adresse: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    localisation: {
      type: DataTypes.STRING,
      allowNull: false
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: "entreprises",
    underscored: true,
    timestamps: true
  });

  Enterprise.associate = (models) => {
    Enterprise.hasMany(models.Service, {
      foreignKey: 'enterprise_id', 
      as: 'services'
    });
    
    Enterprise.hasMany(models.Video, {
      foreignKey: 'enterprise_id',
      as: 'videos'
    });
    
    Enterprise.hasMany(models.Contact, {
      foreignKey: 'enterprise_id',
      as: 'contacts'
    });
    
    Enterprise.hasMany(models.Temoignage, {
      foreignKey: 'enterprise_id',
      as: 'temoignages'
    });
    
    Enterprise.hasMany(models.Solution, {
      foreignKey: 'enterprise_id',
      as: 'solutions'
    });
    
    Enterprise.hasMany(models.Notifications, {
      foreignKey: 'enterprise_id',
      as: 'notifications'
    });
  };

  return Enterprise;
};