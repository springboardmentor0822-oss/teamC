import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./loginPage";
import Dashboard from "./Dashboard";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import CreatePetition from "./CreatePetition";
import PetitionList from "./PetitionList";
import OfficialPetitions from "./OfficialPetitions";
import Profile from "./Profile";
import EditPetition from "./EditPetition";
import OfficialDashboard from "./Pages/officialDashboard";
import VerifyEmail from "./VerifyEmail";
import CreatePoll from "./Pollss/CreatePoll";
import PollList from "./Pollss/PollList";
import MyPetitions from "./MyPetitions";
import Reports from "./Pages/Reports";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<LoginPage />} />

        {/* ✅ DASHBOARD ROUTES */}
        <Route path="/dashboard" element={<Dashboard />}>

          <Route index element={<div />} />

          <Route path="polls" element={<PollList />} />

          <Route path="petitions" element={<PetitionList />} />

          <Route path="mypetitions" element={<MyPetitions />} />

          {/* ✅ FIXED: moved inside */}
          <Route path="reports" element={<Reports />} />

        </Route>

        {/* OTHER ROUTES */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/create-petition" element={<CreatePetition />} />
        <Route path="/official-petitions" element={<OfficialPetitions />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-petition/:id" element={<EditPetition />} />
        <Route path="/official-dashboard" element={<OfficialDashboard />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/create-poll" element={<CreatePoll />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;