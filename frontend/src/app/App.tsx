import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router";
import { LoginPage } from "./features/auth/presentation/pages/LoginPage";
import { CompletionPage } from "./features/auth/presentation/pages/CompletionPage";
import { RegisterPage } from "./features/auth/presentation/pages/RegisterPage";
import { SetupPage } from "./features/auth/presentation/pages/SetupPage";
import { MyTimbresPage } from "./features/timbre/presentation/pages/MyTimbresPage";
import { NewTimbrePage } from "./features/timbre/presentation/pages/NewTimbrePage";

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/concluido" element={<CompletionPage />} />
        <Route path="/novo-timbre" element={<NewTimbrePage />} />
        <Route path="/meus-timbres" element={<MyTimbresPage />} />
      </Routes>
    </Router>
  );
}
