var DataTypes = require("sequelize").DataTypes;
var _auth = require("./auth");
var _note = require("./note");
var _user = require("./user");

function initModels(sequelize) {
  var auth = _auth(sequelize, DataTypes);
  var note = _note(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);

  user.belongsTo(auth, { as: "auth", foreignKey: "auth_id"});
  auth.hasOne(user, { as: "user", foreignKey: "auth_id"});
  note.belongsTo(user, { as: "user", foreignKey: "user_id"});
  user.hasMany(note, { as: "notes", foreignKey: "user_id"});

  return {
    auth,
    note,
    user,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
