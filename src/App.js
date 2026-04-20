// src/App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import { I18nProvider } from "./lib/i18n";
import Header from "./components/Header";
import Discover from "./pages/Discover";
import StoryDetail from "./pages/StoryDetail";
import Write from "./pages/Write";
import Dashboard from "./pages/Dashboard";
import Plans from "./pages/Plans";
import { Register, Login } from "./pages/Auth";
import "./styles.css";

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="app">
            <Header />
            <main className="main">
              <Routes>
                <Route path="/"            element={<Discover />}    />
                <Route path="/story/:slug" element={<StoryDetail />} />
                <Route path="/write"       element={<Write />}       />
                <Route path="/edit/:slug"  element={<Write />}       />
                <Route path="/dashboard"   element={<Dashboard />}   />
                <Route path="/plans"       element={<Plans />}       />
                <Route path="/register"    element={<Register />}    />
                <Route path="/login"       element={<Login />}       />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </I18nProvider>
  );
}
