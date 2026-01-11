import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import RepositoryCard from "../common/RepositoryCard";
import { useApp } from "../../contexts/AppContext";
import "./repo.css";

const StarredRepos = () => {
  const navigate = useNavigate();
  const { starredRepos, loading, error, fetchStarredRepos } = useApp();

  useEffect(() => {
    fetchStarredRepos();
  }, [fetchStarredRepos]);

  const userId = localStorage.getItem("userId");
  
  if (!userId) {
    navigate("/auth");
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="starred-repos-wrapper">
        <div className="starred-repos-container">
          <div className="page-header">
            <h1 className="page-title">Starred repositories</h1>
            <p className="page-subtitle">
              {starredRepos.length > 0
                ? `${starredRepos.length} ${starredRepos.length === 1 ? 'repository' : 'repositories'}`
                : 'Repositories you star appear here'}
            </p>
          </div>

          {loading.starred ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading starred repositories...</p>
            </div>
          ) : error.starred ? (
            <div className="error-container">
              <div className="error-icon">
                <svg
                  aria-hidden="true"
                  height="48"
                  width="48"
                  viewBox="0 0 16 16"
                  fill="#f85149"
                >
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
              </div>
              <h3>Something went wrong</h3>
              <p>{error.starred}</p>
              <button
                className="retry-button"
                onClick={fetchStarredRepos}
              >
                Try again
              </button>
            </div>
          ) : starredRepos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg
                  aria-hidden="true"
                  height="64"
                  width="64"
                  viewBox="0 0 16 16"
                  fill="#8b949e"
                >
                  <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z" />
                </svg>
              </div>
              <h3>No starred repositories</h3>
              <p>Star repositories you find interesting to see them here.</p>
              <button
                className="explore-button"
                onClick={() => navigate("/")}
              >
                Explore repositories
              </button>
            </div>
          ) : (
            <div className="starred-repos-grid">
              {starredRepos.map((repo) => (
                <RepositoryCard
                  key={repo._id}
                  repo={repo}
                  showStarButton={true}
                  showOwner={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StarredRepos;
