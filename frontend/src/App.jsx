import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Contact from "./pages/Contact";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Global background video -- lives here (not inside a page) so it
            keeps playing continuously across every route instead of
            restarting every time you navigate. */}
        <video
          className="site-video-bg"
          src="/videos/Background_video.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="site-video-overlay" />

        <div className="site-content">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
