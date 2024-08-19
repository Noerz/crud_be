const express = require('express');

const{authRoutes} = require("./authRoute");
const{noteRoutes} = require("./noteRoute");


const router = express.Router();

authRoutes(router);
noteRoutes(router);



module.exports = router;