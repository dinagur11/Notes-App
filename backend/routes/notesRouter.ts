import { Router } from 'express';
import * as notesController from '../controllers/notesController.ts';

const router = Router();

// Add the filter route BEFORE the /:id routes so "filter" isn't treated as an ID
router.get('/filter', notesController.filterNotes);

router.get('/by-index/:i', notesController.getNoteByIndex);
router.put('/by-index/:i', notesController.updateNoteByIndex);
router.delete('/by-index/:i', notesController.deleteNoteByIndex);

router.get('/', notesController.getAllNotes);
router.get('/:id', notesController.getNote);
router.post('/', notesController.createNote);
router.put('/:id', notesController.updateNote);
router.delete('/:id', notesController.deleteNote);

export default router;