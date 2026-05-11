import { useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import { configureAuth } from "./api/client.js";
import DashboardPage from "./pages/DashboardPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import VoicePage from "./pages/VoicePage.jsx";
import { useAccountStore } from "./store/accountStore.js";
import { useAuthStore } from "./store/authStore.js";
import { useChatStore } from "./store/chatStore.js";

function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const resetChat = useChatStore((s) => s.reset);
  const resetAccount = useAccountStore((s) => s.reset);

  useEffect(() => {
    configureAuth(
      () => useAuthStore.getState().token,
      () => {
        logout();
        resetChat();
        resetAccount();
        navigate("/login", { replace: true });
      },
    );
  }, [logout, navigate, resetAccount, resetChat]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="/voice" element={<VoicePage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
