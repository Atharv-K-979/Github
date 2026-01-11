import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./profile.css";
import Navbar from "../Navbar";
import { UnderlineNav } from "@primer/react";
import { BookIcon, RepoIcon } from "@primer/octicons-react";
import HeatMapProfile from "./HeatMap";
import { useAuth } from "../../authContext";
import { useApp } from "../../contexts/AppContext";

const Profile = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({ username: "username", email: "" });
  const { setCurrentUser } = useAuth();
  const { toggleFollow, following, followers, fetchUserProfile } = useApp();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");
  const currentProfileUserId = userId; // For now, viewing own profile

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (userId) {
        try {
          setLoading(true);
          const response = await axios.get(
            `http://localhost:3002/userProfile/${userId}`
          );
          setUserDetails(response.data);
          await fetchUserProfile(userId);
          setIsFollowing(following.has(userId));
        } catch (err) {
          console.error("Cannot fetch user details: ", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUserDetails();
  }, [userId, fetchUserProfile, following]);

  const handleFollow = async () => {
    if (currentProfileUserId) {
      try {
        await toggleFollow(currentProfileUserId);
        setIsFollowing(!isFollowing);
      } catch (err) {
        console.error("Error toggling follow:", err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setCurrentUser(null);
    navigate("/auth");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-page">
        <div className="profile-header">
          <UnderlineNav aria-label="Repository">
            <UnderlineNav.Item
              aria-current="page"
              icon={BookIcon}
              sx={{
                backgroundColor: "transparent",
                color: "white",
                "&:hover": {
                  textDecoration: "underline",
                  color: "white",
                },
              }}
            >
              Overview
            </UnderlineNav.Item>

            <UnderlineNav.Item
              onClick={() => navigate("/starred")}
              icon={RepoIcon}
              sx={{
                backgroundColor: "transparent",
                color: "whitesmoke",
                "&:hover": {
                  textDecoration: "underline",
                  color: "white",
                },
              }}
            >
              Starred Repositories
            </UnderlineNav.Item>
          </UnderlineNav>
        </div>

        <div className="profile-content">
          <aside className="profile-sidebar">
            <div className="profile-card">
              <div className="profile-avatar">
                <div className="avatar-placeholder">
                  {userDetails.username?.[0]?.toUpperCase() || "U"}
                </div>
              </div>
              <h1 className="profile-username">{userDetails.username || "username"}</h1>
              <p className="profile-bio">{userDetails.email || ""}</p>
              
              <button
                className={`follow-button ${isFollowing ? "following" : ""}`}
                onClick={handleFollow}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>

              <div className="profile-stats">
                <div className="stat-item">
                  <Link to="/followers" className="stat-link">
                    <span className="stat-number">{followers}</span>
                    <span className="stat-label">followers</span>
                  </Link>
                </div>
                <div className="stat-item">
                  <Link to="/following" className="stat-link">
                    <span className="stat-number">{following.size}</span>
                    <span className="stat-label">following</span>
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          <main className="profile-main">
            <div className="profile-tabs">
              <button className="tab-button active">Overview</button>
              <button className="tab-button">Repositories</button>
              <button className="tab-button">Projects</button>
            </div>

            <div className="profile-content-area">
              <div className="contribution-graph">
                <h2 className="section-title">Contributions</h2>
                <HeatMapProfile />
              </div>
            </div>
          </main>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </>
  );
};

export default Profile;
