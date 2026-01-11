import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import RepositoryCard from "../common/RepositoryCard";
import { useApp } from "../../contexts/AppContext";
import "./dashboard.css";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  
  const {
    repositories,
    suggestedRepos,
    loading,
    error,
    fetchRepositories,
    fetchSuggestedRepos,
    refreshData,
  } = useApp();

  useEffect(() => {
    fetchRepositories();
    fetchSuggestedRepos();
  }, [fetchRepositories, fetchSuggestedRepos]);

  useEffect(() => {
    if (!Array.isArray(repositories)) {
      setSearchResults([]);
      return;
    }
    
    if (searchQuery.trim() === "") {
      setSearchResults(repositories);
    } else {
      const filtered = repositories.filter((repo) =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setSearchResults(filtered);
    }
  }, [searchQuery, repositories]);

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-layout">
          {/* Left Sidebar - Suggested Repositories */}
          <aside className="dashboard-sidebar">
            <div className="sidebar-section">
              <h2 className="sidebar-title">Explore repositories</h2>
              {loading.suggested ? (
                <div className="loading-state">Loading...</div>
              ) : error.suggested ? (
                <div className="error-state">{error.suggested}</div>
              ) : suggestedRepos.length > 0 ? (
                <div className="suggested-repos-list">
                  {suggestedRepos.slice(0, 5).map((repo) => (
                    <RepositoryCard
                      key={repo._id}
                      repo={repo}
                      showStarButton={true}
                      showOwner={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No suggested repositories available.</p>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content - User Repositories */}
          <main className="dashboard-main">
            <div className="dashboard-header">
              <h1 className="dashboard-title">Your repositories</h1>
              <button
                className="new-repo-button"
                onClick={() => window.location.href = "/create"}
              >
                New
              </button>
            </div>

            <div className="search-container">
              <input
                type="text"
                className="search-input"
                value={searchQuery}
                placeholder="Find a repository..."
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {loading.repos ? (
              <div className="loading-state">Loading repositories...</div>
            ) : error.repos ? (
              <div className="error-state">
                <p>{error.repos}</p>
                <button onClick={refreshData} className="retry-button">
                  Try again
                </button>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="repositories-list">
                {searchResults.map((repo) => (
                  <RepositoryCard
                    key={repo._id}
                    repo={repo}
                    showStarButton={false}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg
                    aria-hidden="true"
                    height="64"
                    width="64"
                    viewBox="0 0 24 24"
                    fill="#8b949e"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <h3>No repositories found</h3>
                <p>
                  {searchQuery
                    ? "Try adjusting your search query."
                    : "Get started by creating a new repository."}
                </p>
                {!searchQuery && (
                  <button
                    className="create-repo-button"
                    onClick={() => window.location.href = "/create"}
                  >
                    Create repository
                  </button>
                )}
              </div>
            )}
          </main>

          {/* Right Sidebar - Events/Info */}
          <aside className="dashboard-sidebar-right">
            <div className="sidebar-section">
              <h3 className="sidebar-title">Recent activity</h3>
              <div className="activity-list">
                <div className="activity-item">
                  <p className="activity-text">No recent activity</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
