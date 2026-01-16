import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./profile.css";
import Navbar from "../Navbar";
import { UnderlineNav } from "@primer/react";
import { BookIcon, RepoIcon } from "@primer/octicons-react";
import { useAuth } from "../../authContext";
import { useApp } from "../../contexts/AppContext";

import HeatMap from "@uiw/react-heat-map";
import Tooltip from "@uiw/react-tooltip";

const generateDummyContributions = () => {
  const dummy = [];
  for (let i = 1; i <= 8; i++) {
    dummy.push({
      date: `2025/01/${String(i).padStart(2, "0")}`,
      count: Math.floor(Math.random() * 6) + 1,
    });
  }
  for (let i = 20; i <= 30; i++) {
    dummy.push({
      date: `2024/12/${i}`,
      count: Math.floor(Math.random() * 5) + 1,
    });
  }

  return dummy;
};

const Profile = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();
  const { toggleFollow, following, followers, fetchUserProfile } = useApp();

  const [userDetails, setUserDetails] = useState({
    username: "username",
    email: "",
  });
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState([]);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const userRes = await axios.get(
          `http://localhost:3002/userProfile/${userId}`
        );
        setUserDetails(userRes.data);

        await fetchUserProfile(userId);
        setIsFollowing(following.has(userId));

        const activityRes = await axios.get(
          `http://localhost:3002/api/contributions/${userId}`
        );

        const arr = Array.isArray(activityRes.data)
          ? activityRes.data
          : activityRes.data?.items || [];

        setActivityData(arr);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setActivityData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, fetchUserProfile, following]);
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(
          `http://localhost:3002/api/contributions/${userId}`
        );
        const arr = Array.isArray(res.data)
          ? res.data
          : res.data?.items || [];
        setActivityData(arr);
      } catch {
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [userId]);
  const heatMapValue = useMemo(() => {
    const backend = activityData.map((item) => ({
      date: item.date?.replace(/-/g, "/"),
      count: item.count || 0,
    }));

    const dummy = generateDummyContributions();

    return [...backend, ...dummy];
  }, [activityData]);

  const handleFollow = async () => {
    try {
      await toggleFollow(userId);
      setIsFollowing((prev) => !prev);
    } catch (err) {
      console.error("Follow toggle error:", err);
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
          <UnderlineNav aria-label="Profile Navigation">
            <UnderlineNav.Item icon={BookIcon} aria-current="page">
              Overview
            </UnderlineNav.Item>
            <UnderlineNav.Item
              icon={RepoIcon}
              onClick={() => navigate("/starred")}
            >
              Starred Repositories
            </UnderlineNav.Item>
          </UnderlineNav>
        </div>

        <div className="profile-content">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-card">
              <div className="profile-avatar">
                <div className="avatar-placeholder">
                  {userDetails.username?.[0]?.toUpperCase() || "U"}
                </div>
              </div>

              <h1 className="profile-username">{userDetails.username}</h1>
              <p className="profile-bio">{userDetails.email}</p>

              <button
                className={`follow-button ${isFollowing ? "following" : ""}`}
                onClick={handleFollow}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>

              <div className="profile-stats">
                <Link to="/followers" className="stat-link">
                  <span className="stat-number">{followers}</span>
                  <span className="stat-label">followers</span>
                </Link>

                <Link to="/following" className="stat-link">
                  <span className="stat-number">{following.size}</span>
                  <span className="stat-label">following</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="profile-main">
            <div className="profile-tabs">
              <button className="tab-button active">Overview</button>
              <button className="tab-button">Repositories</button>
              <button className="tab-button">Projects</button>
            </div>

            <div className="profile-content-area">
              <h2 className="section-title">Contributions</h2>

              <div className="gh-heatmap-container">
                <HeatMap
                  value={heatMapValue}
                  startDate={new Date("2024/01/01")}
                  style={{ width: "100%" }}
                  panelColors={{
                    0: "#9b9b9bff",
                    2: "#0e4429",
                    4: "#006d32",
                    10: "#26a641",
                    20: "#39d353",
                  }}
                  rectProps={{ rx: 2 }}
                  rectRender={(props, data) => (
                    <Tooltip
                      placement="top"
                      content={`${data.count || 0} contributions on ${data.date}`}
                    >
                      <rect {...props} />
                    </Tooltip>
                  )}
                />
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
