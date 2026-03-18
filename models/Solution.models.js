module.exports = (sequelize, DataTypes) => {
  const Solution = sequelize.define('Solution', {
    titre: {
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
    enterprise_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'entreprises',
        key: 'id'
      }
    }
  }, {
    tableName: "solutions",
    underscored: true,
    timestamps: true
  });

  Solution.associate = (models) => {
    Solution.belongsTo(models.Enterprise, {
      foreignKey: 'enterprise_id',
      as: 'enterprise'
    });
    
    Solution.belongsToMany(models.Service, {
      through: models.ServiceSolution,
      foreignKey: 'solution_id',
      otherKey: 'service_id',
      as: 'services'
    });
  };

  return Solution;
};