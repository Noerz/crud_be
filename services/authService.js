const db = require("../config/database");
const initModels = require("../models/init-models");
const models = initModels(db);
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ConflictError, NotFoundError, UnauthorizedError, InternalServerError } = require("../middleware/errorHandler");

async function registerUser({ fullName, email, password }) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newAuth = await models.auth.create({
      email,
      password: hashPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (!newAuth) {
      throw new InternalServerError("Failed to create auth entry");
    }

    const newUser = await models.user.create({
      fullName,
      adress: "",
      noHp: "",
      auth_id: newAuth.idAuth,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      code: 201,
      status: "success",
      message: "User registered successfully",
      // data: newUser,
    };
  } catch (error) {
    // Check for unique constraint violation (duplicate email)
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new ConflictError("Email already exists");
    }
    // Re-throw custom errors or sequelize errors (akan ditangani oleh errorHandler)
    throw error;
  }
}

async function loginUser({ email, password }) {
  const auth = await models.auth.findOne({ where: { email } });
  if (!auth) {
    throw new NotFoundError("Email not found");
  }

  const match = await bcrypt.compare(password, auth.password);
  if (!match) {
    throw new UnauthorizedError("Incorrect password");
  }

  const user = await models.user.findOne({ where: { auth_id: auth.idAuth } });
  if (!user) {
    throw new NotFoundError("User not found");
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
