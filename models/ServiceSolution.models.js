module.exports = (sequelize, DataTypes) => {
  const ServiceSolution = sequelize.define('ServiceSolution', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'services',
        key: 'id'
      }
    },
    solution_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'solutions',
        key: 'id'
      }
    },
    quantite: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: "service_solution",
    underscored: true,
    timestamps: true
  });

  return ServiceSolution;
};