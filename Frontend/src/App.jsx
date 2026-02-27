import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./loginPage";
import Dashboard from "./Dashboard";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import CreatePetition from "./CreatePetition";
import PetitionList from "./PetitionList";
import OfficialPetitions from "./OfficialPetitions";

function App() {
  const token = localStorage.getItem("accessToken");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/" />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/create-petition" element={<CreatePetition />} />
        <Route path="/petitions" element={<PetitionList />} />
        <Route path="/official-petitions" element={<OfficialPetitions />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
