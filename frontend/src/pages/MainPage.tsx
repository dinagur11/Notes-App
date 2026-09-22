import { useEffect, useReducer, useRef, useState } from "react";
import axios from "axios";
import "./MainPage.css";
import type { Note } from "../Note";
import NoteItem from "../components/NoteItem";
import Pages, { getPageNumbers } from "../components/Pages";
import { useNotification } from "../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AIAssistant from "../components/AIAssistant";

const POSTS_PER_PAGE = 10;
const NOTES_URL = "http://localhost:3001/notes";

const PageAction = { Previous: -1, First: -2, Next: -3, Last: -4 } as const;

type State = {
  currentPage: number;
  notes: Note[];
  totalPages: number;
  newNoteClicked: boolean;
  newNoteContent: string;
  changesCounter: number;
};

type Action =
  | { type: "SET_NOTES"; payload: Note[] }
  | { type: "SET_TOTAL_PAGES"; payload: number }
  | { type: "SET_PAGE"; payload: number }
  | { type: "OPEN_NEW_NOTE" }
  | { type: "CLOSE_NEW_NOTE" }
  | { type: "SET_NEW_NOTE_CONTENT"; payload: string }
  | { type: "SET_CHANGES_COUNTER"; payload: number };

const initialState: State = {
  currentPage: 1,
  notes: [],
  totalPages: 1,
  newNoteClicked: false,
  newNoteContent: "",
  changesCounter: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_NOTES": return { ...state, notes: action.payload };
    case "SET_TOTAL_PAGES": return { ...state, totalPages: action.payload };
    case "SET_PAGE": return { ...state, currentPage: action.payload };
    case "OPEN_NEW_NOTE": return { ...state, newNoteClicked: true };
    case "CLOSE_NEW_NOTE": return { ...state, newNoteClicked: false, newNoteContent: "" };
    case "SET_NEW_NOTE_CONTENT": return { ...state, newNoteContent: action.payload };
    case "SET_CHANGES_COUNTER": return { ...state, changesCounter: action.payload };
    default: return state;
  }
}

function fetchPage(page: number) {
  return axios.get(NOTES_URL, { params: { _page: page, _per_page: POSTS_PER_PAGE } });
}

function MainPage() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { notification, setNotification } = useNotification();
  const { user, setUser } = useAuth();
  const cacheRef = useRef<Record<number, Note[]>>({});
  const isLogged = user !== null;

  // HW4 addition: sanitizer toggle. React state only — defaults to ON, resets on refresh.
  const [sanitizerOn, setSanitizerOn] = useState(true);

  // Dina's caching: clear the cache first when notes change, so the fetch effect repopulates fresh.
  useEffect(() => {
    cacheRef.current = {};
  }, [state.changesCounter]);

  useEffect(() => {
    if (state.currentPage in cacheRef.current) {
      dispatch({ type: "SET_NOTES", payload: cacheRef.current[Number(state.currentPage)] });
    } else {
      fetchPage(state.currentPage)
        .then((response) => {
          dispatch({ type: "SET_NOTES", payload: response.data });
          cacheRef.current[state.currentPage] = response.data;
          const totalItems = Number(response.headers["x-total-count"]);
          dispatch({ type: "SET_TOTAL_PAGES", payload: Math.ceil(totalItems / POSTS_PER_PAGE) });
        })
        .catch((error) => console.log("Encountered an error: " + error));
    }
    const toCache: number[] = getPageNumbers(state.currentPage, state.totalPages);
    for (const newPage of toCache) {
      if (!(newPage in cacheRef.current) && newPage !== state.currentPage) {
        fetchPage(newPage).then((response) => { cacheRef.current[newPage] = response.data; });
      }
    }
    for (const cachedPage of Object.keys(cacheRef.current)) {
      if (!toCache.includes(Number(cachedPage))) delete cacheRef.current[Number(cachedPage)];
    }
  }, [state.currentPage, state.changesCounter, state.totalPages]);

  function handleClickPage(newPage: number) {
    if (newPage === PageAction.Previous) dispatch({ type: "SET_PAGE", payload: state.currentPage - 1 });
    else if (newPage === PageAction.First) dispatch({ type: "SET_PAGE", payload: 1 });
    else if (newPage === PageAction.Last) dispatch({ type: "SET_PAGE", payload: state.totalPages });
    else if (newPage === PageAction.Next) dispatch({ type: "SET_PAGE", payload: state.currentPage + 1 });
    else dispatch({ type: "SET_PAGE", payload: newPage });
  }

  function handleSaveNew() {
    axios
      .post(
        NOTES_URL,
        {
          title: "New Note",
          content: state.newNoteContent,
          author: { name: user?.name, email: user?.email },
        },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      )
      .then(() => {
        dispatch({ type: "CLOSE_NEW_NOTE" });
        dispatch({ type: "SET_PAGE", payload: 1 });
        dispatch({ type: "SET_CHANGES_COUNTER", payload: state.changesCounter + 1 });
        setNotification("Added a new note");
      })
      .catch((error) => console.log(error));
  }

  return (
    <>
      <div className="notification">{notification}</div>
      <div className="title">
        {!isLogged ? (
          <>
            <button onClick={() => navigate("/login")} data-testid="go_to_login_button">Go to Login</button>
            <button onClick={() => navigate("/create-user")} data-testid="go_to_create_user_button">Create New User</button>
          </>
        ) : (
          <button onClick={() => setUser(null)} data-testid="logout">logout</button>
        )}

        {/* HW4 addition: sanitizer toggle — always visible, React state only */}
        <button data-testid="sanitizer_toggle" onClick={() => setSanitizerOn((on) => !on)}>
          {sanitizerOn ? "Sanitizer: ON" : "Sanitizer: OFF"}
        </button>

        <h1>Did you know?</h1>
        <h2>fun facts you may not know!</h2>
      </div>

      {isLogged && (
        <div className="new-note-area">
          {state.newNoteClicked ? (
            <>
              <input
                type="text"
                value={state.newNoteContent}
                name="text_input_new_note"
                onChange={(e) => dispatch({ type: "SET_NEW_NOTE_CONTENT", payload: e.target.value })}
              />
              <AIAssistant
                onGenerate={(text) =>
                  dispatch({
                    type: "SET_NEW_NOTE_CONTENT",
                    payload: state.newNoteContent ? state.newNoteContent + "\n\n" + text : text,
                  })
                }
              />
              <button name="text_input_save_new_note" onClick={handleSaveNew}>Save</button>
              <button name="text_input_cancel_new_note" onClick={() => dispatch({ type: "CLOSE_NEW_NOTE" })}>Cancel</button>
            </>
          ) : (
            <button name="text_input_new_note" onClick={() => dispatch({ type: "OPEN_NEW_NOTE" })}>New Note</button>
          )}
        </div>
      )}

      <div className="notes">
        {state.notes.map((note: Note) => (
          <NoteItem
            key={note._id}
            note={note}
            sanitizerOn={sanitizerOn}
            onUpdate={() => dispatch({ type: "SET_CHANGES_COUNTER", payload: state.changesCounter + 1 })}
          />
        ))}
      </div>

      <div className="buttons">
        <Pages currPage={state.currentPage} totalPages={state.totalPages} handleClick={handleClickPage} />
      </div>
    </>
  );
}

export default MainPage;