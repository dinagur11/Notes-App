import { useMemo, useState } from "react";
import type { Note } from "../Note";
import { useNotification } from "../contexts/NotificationContext";
import { useAuth } from "../contexts/AuthContext";
import { sanitizeHtml } from "../sanitize";
import axios from "axios";

const NOTES_URL = "http://localhost:3001/notes";

export default function NoteItem({
  note,
  onUpdate,
  sanitizerOn,
}: {
  note: Note;
  onUpdate: () => void;
  sanitizerOn: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [noteContent, setNoteContent] = useState(note.content);
  const { setNotification } = useNotification();
  const { user } = useAuth();

  const safeHtml = useMemo(
    () => (sanitizerOn ? sanitizeHtml(note.content) : note.content),
    [note.content, sanitizerOn]
  );

  const isAuthor = user?.email === note.author?.email;

  return (
    <div className="note" data-testid={note._id}>
      <h2>{note.title}</h2>
      <small>By {note.author?.name}</small>
      <br />
      {isEditing ? (
        <>
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            data-testid={`text_input-${note._id}`}
          ></textarea>
          <button data-testid={`text_input_save-${note._id}`} onClick={handleSave}>Save</button>
          <button data-testid={`text_input_cancel-${note._id}`} onClick={handleCancel}>Cancel</button>
        </>
      ) : (
        <>
          {/* dangerouslySetInnerHTML is the explicit opt-out of React's built-in
              XSS protection (lecture 10, the $$typeof / text-escaping mechanism). */}
          <div
            className="note-body"
            data-testid="note_body"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
          {isAuthor && (
            <>
              <button data-testid={`delete-${note._id}`} onClick={handleDelete}>Delete</button>
              <button data-testid={`edit-${note._id}`} onClick={handleEdit}>Edit</button>
            </>
          )}
        </>
      )}
    </div>
  );

  function handleEdit() {
    setIsEditing(true);
  }
  function handleSave() {
    axios
      .put(`${NOTES_URL}/${note._id}`, { newContent: noteContent }, { headers: { Authorization: `Bearer ${user?.token}` } })
      .then(() => { setIsEditing(false); setNotification("Note updated"); onUpdate(); })
      .catch((error) => { setNotification("Error saving changes."); setIsEditing(false); console.log(error); });
  }
  function handleCancel() {
    setNoteContent(note.content);
    setIsEditing(false);
  }
  function handleDelete() {
    axios
      .delete(`${NOTES_URL}/${note._id}`, { headers: { Authorization: `Bearer ${user?.token}` } })
      .then(() => { setIsEditing(false); setNotification("Note deleted"); onUpdate(); })
      .catch((error) => { setNotification("Error deleting note."); setIsEditing(false); console.log(error); });
  }
}