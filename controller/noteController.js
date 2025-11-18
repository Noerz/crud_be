const {
  getNotesByUser,
  createNoteForUser,
  updateNoteForUser,
  deleteNoteForUser,
} = require("../services/noteService");

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const getNotes = asyncHandler(async (req, res) => {
  const { user_id } = req.decoded;
  const notes = await getNotesByUser(user_id);
  if (!notes || notes.length === 0) {
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
    data: notes,
  });
});

const createNote = asyncHandler(async (req, res) => {
  const { user_id } = req.decoded;
  const { title, content } = req.body;
  const newNote = await createNoteForUser(user_id, { title, content });
  res.status(201).json({
    code: 201,
    status: "success",
    message: "Note created successfully",
    data: newNote,
  });
});

const updateNote = asyncHandler(async (req, res) => {
  const { user_id } = req.decoded;
  const { title, content, idNote } = req.body;
  await updateNoteForUser(user_id, idNote, { title, content });
  res.status(200).json({
    code: 200,
    status: "success",
    message: "Note updated successfully",
  });
});

const deleteNote = asyncHandler(async (req, res) => {
  const { user_id } = req.decoded;
  const { idNote } = req.body;
  await deleteNoteForUser(user_id, idNote);
  res.status(200).json({
    code: 200,
    status: "success",
    message: "Note deleted successfully",
  });
});

module.exports = { getNotes, createNote, updateNote, deleteNote };
