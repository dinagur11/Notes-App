import Note from '../models/note.ts';

type NewNote = {
  title: string;
  content: string;
  author?: { name?: string; email?: string } | null | undefined;
  user?: string | undefined;
};

export const getAllNotes = async (query: Record<string, unknown>) => {
  const page = Number(query._page) || 1;
  const perPage = Number(query._per_page) || 10;
  const skip = (page - 1) * perPage;

  const [notes, count] = await Promise.all([
    Note.find().sort({ _id: -1 }).skip(skip).limit(perPage),
    Note.countDocuments(),
  ]);

  return { notes, count };
};

export const getNoteByid = async (id: string) => {
  return Note.findById(id);
};

export const addNote = async (note: NewNote) => {
  return Note.create(note);
};

export const deleteNoteById = async (id: string) => {
  return Note.findByIdAndDelete(id);
};

export const updateNoteById = async (id: string, newContent: string) => {
  return Note.findByIdAndUpdate(id, { content: newContent }, { new: true });
};

export const getNoteByIndex = async (index: number) => {
  return Note.findOne().sort({ _id: -1 }).skip(index);
};

export const deleteNoteByIndex = async (index: number) => {
  const note = await Note.findOne().sort({ _id: -1 }).skip(index);
  if (!note) return null;
  return Note.findByIdAndDelete(note._id);
};

export const updateNoteByIndex = async (index: number, newContent: string) => {
  const note = await Note.findOne().sort({ _id: -1 }).skip(index);
  if (!note) return null;
  return Note.findByIdAndUpdate(note._id, { content: newContent }, { new: true });
};