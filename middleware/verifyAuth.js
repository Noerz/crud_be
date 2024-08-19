const jwt = require("jsonwebtoken");
const db = require("../config/database");
const initModels = require("../models/init-models");
const models = initModels(db);

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    
    if (!token) {
      return res.status(403).json({ message: 'No token provided' });
    }
  
    try {
      // Hapus "Bearer " dari token jika ada
      const bearerToken = token.split(' ')[1] || token;
      
      jwt.verify(bearerToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: 'Unauthorized!' });
        }
  
        req.decoded = decoded; // Simpan data yang di-decode ke req
        next();
      });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to authenticate token' });
    }
  };

const isAdmin = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const admin = await models.user.findOne({
      where: { email: decoded.email },
    });

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ msg: "Hanya admin yang dapat mengakses" });
    }

    next();
  } catch (err) {
    return res.sendStatus(403);
  }
};

module.exports = { verifyToken, isAdmin };
