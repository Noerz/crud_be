const db = require("../config/database");
const initModels = require("../models/init-models");
const models = initModels(db);
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const Register = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Create entry in the auth table
    const newAuth = await models.auth.create({
      email,
      password: hashPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // If auth entry is created successfully, use the returned idAuth to create user entry
    if (newAuth) {
      const newUser = await models.user.create({
        fullName,
        adress: "",
        noHp: "",
        auth_id: newAuth.idAuth,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      res
        .status(201)
        .json({ msg: "User registered successfully", data: newUser });
    } else {
      res.status(400).json({ msg: "Failed to create auth entry" });
    }
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ msg: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const auth = await models.auth.findOne({ where: { email } });

    if (!auth) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "Email not found",
        data: null,
      });
    }

    const match = await bcrypt.compare(password, auth.password);
    if (!match) {
      return res.status(401).json({
        code: 401,
        status: "error",
        message: "Incorrect password",
        data: null,
      });
    }

    const user = await models.user.findOne({ where: { auth_id: auth.idAuth } });
    if (!user) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "User not found",
        data: null,
      });
    }

    const accessToken = jwt.sign(
      { user_id: user.idUser, email: auth.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    const result = {
      userId: user.idUser,
      email: auth.email,
      role: auth.role,
      accessToken: accessToken,
    };

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: error.message,
      data: null,
    });
  }
};

module.exports = { Register, login };
