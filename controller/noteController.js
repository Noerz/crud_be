const db = require("../config/database");
const initModels = require("../models/init-models");
const models = initModels(db);

// Get all notes for a user
const getNotes = async (req, res) => {
  try {
    const { user_id } = req.decoded;
    const whereCondition = {};

    if (user_id) {
      whereCondition.user_id = user_id;
    }
    const response = await models.note.findAll({ where: whereCondition });
    if (response.length === 0) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "Note tidak ditemukan",
        data: null,
      });
    }
    res.status(200).json({
      code: 200,
      status: "success",
      message: "All note retrieved successfully",
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      status: "error",
      message: error.message,
      data: null,
    });
  }
};

// Create a new note
const createNote = async (req, res) => {
  try {
    const { user_id } = req.decoded;
    const { title, content } = req.body;

    const newNote = await models.note.create({
      user_id, // Gunakan `user_id` jika itu yang didefinisikan di database
      title,
      content,
    });

    res.status(201).json({
      code: 201,
      status: "success",
      message: "Note created successfully",
      data: newNote,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Update an existing note
const updateNote = async (req, res) => {
  try {
    const { user_id } = req.decoded;
   
    const { title, content,idNote } = req.body;

    const note = await models.note.findOne({
      where: {
        idNote: idNote,
        user_id: user_id,
      },
    });

    if (!note) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "Note not found",
        data: null,
      });
    }

    await models.note.update(
      { title, content },
      {
        where: { idNote: idNote, user_id: user_id },
      }
    );

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Note updated successfully",
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Delete a note
const deleteNote = async (req, res) => {
  try {
    console.log("Decoded JWT:", req.decoded);
    const { user_id } = req.decoded;
    const { idNote } = req.body;

    const note = await models.note.findOne({
      where: { idNote: idNote, user_id: user_id },
    });

    if (!note) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "Note not found",
        data: null,
      });
    }

    await models.note.destroy({
      where: { idNote: idNote, user_id: user_id },
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Note deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
};
