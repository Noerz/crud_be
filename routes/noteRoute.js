const express = require("express");
const router = express.Router();
const {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} = require("../controller/noteController");
const { verifyToken } = require("../middleware/verifyAuth");

const noteRoutes = (router) => {
  router.get("/note", verifyToken, getNotes);
    router.post("/note",verifyToken, createNote);
  //   router.get("/dompet/note",verifyToken, getDompetByIdnote);
  router.put("/note", verifyToken, updateNote);
    router.delete("/note",verifyToken, deleteNote);
};

module.exports = { noteRoutes };
