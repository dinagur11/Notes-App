import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-user" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;