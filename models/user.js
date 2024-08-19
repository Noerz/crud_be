const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user', {
    idUser: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    fullName: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    adress: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    noHp: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    auth_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'auth',
        key: 'idAuth'
      },
      unique: "user_ibfk_1"
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'user',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "idUser" },
        ]
      },
      {
        name: "auth_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "auth_id" },
        ]
      },
    ]
  });
};
