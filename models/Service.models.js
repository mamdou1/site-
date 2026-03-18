module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define('Service', {
    nom: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false
    },
    prix: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    duree: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Durée en jours'
    },
    technologie: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    enterprise_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'entreprises',
        key: 'id'
      }
    }
  }, {
    tableName: "services",
    underscored: true,
    timestamps: true
  });

  Service.associate = (models) => {
    Service.belongsTo(models.Enterprise, {
      foreignKey: 'enterprise_id',
      as: 'enterprise'
    });
    
    Service.belongsToMany(models.Solution, {
      through: models.ServiceSolution,
      foreignKey: 'service_id',
      otherKey: 'solution_id',
      as: 'solutions'
    });
    
    Service.belongsToMany(models.Video, {
      through: 'video_services', 
      foreignKey: 'service_id',
      otherKey: 'video_id',
      as: 'videos'
    });
    
    Service.hasMany(models.Temoignage, {
      foreignKey: 'service_id',
      as: 'temoignages'
    });
  };

  return Service;
};