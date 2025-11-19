const db = require("../config/database");
const initModels = require("../models/init-models");
const models = initModels(db);
const { NotFoundError } = require("../middleware/errorHandler");

async function getNotesByUser(userId) {
  const where = {};
  if (userId) where.user_id = userId;
  const notes = await models.note.findAll({ where });
  return notes;
}

async function createNoteForUser(userId, { title, content }) {
  const newNote = await models.note.create({
    user_id: userId,
    title,
    content,
  });
  return newNote;
}

async function updateNoteForUser(userId, idNote, { title, content }) {
  const note = await models.note.findOne({ where: { idNote, user_id: userId } });
  if (!note) {
    throw new NotFoundError("Note not found");
  }
  await models.note.update({ title, content }, { where: { idNote, user_id: userId } });
  return true;
}

async function deleteNoteForUser(userId, idNote) {
  const note = await models.note.findOne({ where: { idNote, user_id: userId } });
  if (!note) {
    throw new NotFoundError("Note not found");
  }
  await models.note.destroy({ where: { idNote, user_id: userId } });
  return true;
}

module.exports = {
  getNotesByUser,
  createNoteForUser,
  updateNoteForUser,
  deleteNoteForUser,
};
