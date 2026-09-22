import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as noteService from '../services/noteService.js';
import Note from '../models/note.js'; // Imported to run the LLM filter query

export const filterNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.query as string;
    if (!query) {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    // Substring search on content, case-insensitive, chronological order, max 10 results
    const notes = await Note.find({ content: { $regex: query, $options: 'i' } })
      .sort({ _id: 1 })
      .limit(10);

    res.setHeader('X-Total-Count', notes.length.toString());
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllNotes = async (req: Request, res: Response): Promise<void> => {
  const { notes, count } = await noteService.getAllNotes(req.query);
  res.setHeader('X-Total-Count', String(count));
  res.status(200).json(notes);
};

export const createNote = async (req: Request, res: Response): Promise<void> => {
  const { title, content, author } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: 'title and content are required' });
    return;
  }

  // If a valid token is present, link the note to the authoring user (per the schema's `user` ref).
  let user: string | undefined;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.slice(7), process.env.SECRET as string) as {
        id?: string;
      };
      user = decoded.id;
    } catch {
      // Invalid/expired token → create the note without a user link.
    }
  }

  const note = await noteService.addNote({ title, content, author, ...(user ? { user } : {}) });
  res.status(201).json(note);
};

export const getNote = async (req: Request, res: Response): Promise<void> => {
  const note = await noteService.getNoteByid(req.params.id as string);
  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  res.status(200).json(note);
};

export const deleteNote = async (req: Request, res: Response): Promise<void> => {
  const note = await noteService.deleteNoteById(req.params.id as string);
  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  res.status(204).send();
};

export const updateNote = async (req: Request, res: Response): Promise<void> => {
  const { newContent } = req.body;
  if (!newContent) {
    res.status(400).json({ error: 'content is required' });
    return;
  }
  const id = req.params.id as string;
  const note = await noteService.updateNoteById(id, newContent);
  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  res.status(200).json(note);
};

export const getNoteByIndex = async (req: Request, res: Response): Promise<void> => {
  const index = Number(req.params.i);
  const note = await noteService.getNoteByIndex(index);
  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  res.status(200).json(note);
};

export const deleteNoteByIndex = async (req: Request, res: Response): Promise<void> => {
  const index = Number(req.params.i);
  const note = await noteService.deleteNoteByIndex(index);
  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  res.status(204).send();
};

export const updateNoteByIndex = async (req: Request, res: Response): Promise<void> => {
  const { newContent } = req.body;
  if (!newContent) {
    res.status(400).json({ error: 'content is required' });
    return;
  }
  const index = Number(req.params.i);
  const note = await noteService.updateNoteByIndex(index, newContent);
  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  res.status(200).json(note);
};