const db = require("../config/database");
const initModels = require("../models/init-models");
const models = initModels(db);
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function registerUser({ fullName, email, password }) {
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  const newAuth = await models.auth.create({
    email,
    password: hashPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  if (!newAuth) {
    throw new Error("Failed to create auth entry");
  }

  const newUser = await models.user.create({
    fullName,
    adress: "",
    noHp: "",
    auth_id: newAuth.idAuth,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return newUser;
}

async function loginUser({ email, password }) {
  const auth = await models.auth.findOne({ where: { email } });
  if (!auth) {
    const err = new Error("Email not found");
    err.status = 404;
    throw err;
  }

  const match = await bcrypt.compare(password, auth.password);
  if (!match) {
    const err = new Error("Incorrect password");
    err.status = 401;
    throw err;
  }

  const user = await models.user.findOne({ where: { auth_id: auth.idAuth } });
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  const accessToken = jwt.sign(
    { user_id: user.idUser, email: auth.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );

  return {
    userId: user.idUser,
    email: auth.email,
    role: auth.role,
    accessToken,
  };
}

module.exports = { registerUser, loginUser };
