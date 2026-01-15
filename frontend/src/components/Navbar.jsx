import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import { useApp } from "../contexts/AppContext";
import "./navbar.css";
import logo from "../assets/github-mark-white.svg";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { userProfile } = useApp();

  const handleLogoClick = (e) => {
    e.preventDefault();
    navigate("/");
  };

  const getNavItemClass = (path) => {
    const isActive = location.pathname === path || (path === "/" && location.pathname === "/dashboard");
    return isActive ? "nav-item nav-item-active" : "nav-item";
  };

  const displayName =
    userProfile?.username ||
    currentUser?.username ||
    "User";

  const avatarInitial = displayName?.[0]?.toUpperCase() || "U";

  return (
    <header className="app-header">
      <nav className="app-nav">
        <button className="nav-logo" onClick={handleLogoClick}>
          <div className="nav-logo-mark">
            <img src={logo} alt="GitHub" style={{ width: 20, height: 20 }} />
          </div>
          <span className="nav-logo-text">GitHub</span>
        </button>

        <div className="nav-links">
          <Link to="/" className={getNavItemClass("/")}>
            Dashboard
          </Link>
          <Link to="/" className={getNavItemClass("/repositories")}>
            Repositories
          </Link>
          <Link to="/profile" className={getNavItemClass("/profile")}>
            Profile
          </Link>
        </div>

        <div className="nav-right">
          <Link to="/create" className="nav-cta">
            New
          </Link>
          <Link to="/profile" className="nav-user">
            <div className="nav-avatar-wrapper">
              <div className="nav-avatar-circle">
                <span className="nav-avatar-initial">{avatarInitial}</span>
              </div>
              <span className="nav-status-dot" />
            </div>
            <span className="nav-username">{displayName}</span>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
