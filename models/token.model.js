// models/token.model.js
module.exports = (sequelize, DataTypes) => {
  const Token = sequelize.define(
    "Token",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      token: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "token",
      timestamps: true,
      underscored: true,
    },
  );

  Token.associate = (models) => {
    Token.belongsTo(models.Users, { foreignKey: "user_id" });
  };

  return Token;
};
