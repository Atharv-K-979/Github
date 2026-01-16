import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar";
import RepositoryCard from "../common/RepositoryCard";
import { useApp } from "../../contexts/AppContext";
import "./dashboard.css";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [activityItems, setActivityItems] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState(null);
  const [commitItems, setCommitItems] = useState([]);
  const [commitLoading, setCommitLoading] = useState(false);
  const [commitError, setCommitError] = useState(null);
  
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

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    if (!userId) return;
    const fetchActivity = async () => {
      setActivityLoading(true);
      setActivityError(null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const normalizeItems = (data) => {
        const arr = Array.isArray(data) ? data : (data?.items || []);
        const own = arr.filter((item) => {
          const uid = userId?.toString();
          const a =
            item.userId?.toString?.() ||
            item.authorId?.toString?.() ||
            item.actorId?.toString?.() ||
            item.user?.id?.toString?.();
          return uid && a && a === uid;
        });
        return own.slice(0, 3).map((item) => {
          const user =
            item.author?.username ||
            item.username ||
            item.user?.username ||
            item.user ||
            "User";
          const added = item.addedFiles || [];
          const modified = item.modifiedFiles || [];
          const deleted = item.deletedFiles || [];
          const files =
            item.files ||
            item.changedFiles ||
            [...added, ...modified, ...deleted];
          const when = item.timestamp || item.pushedAt || item.date || new Date().toISOString();
          return {
            user,
            summary: `Added ${added.length}, Modified ${modified.length}, Deleted ${deleted.length}`,
            files: Array.isArray(files) ? files : [files].filter(Boolean),
            when,
          };
        });
      };
      try {
        const resp = await axios.get(`http://localhost:3002/activity/pushLogs/${userId}`, { headers });
        const normalized = normalizeItems(resp.data);
        if (normalized.length > 0) {
          setActivityItems(normalized);
        } else {
          try {
            const backup = await axios.get(`http://localhost:3002/userActivity/${userId}`, { headers });
            setActivityItems(normalizeItems(backup.data));
          } catch {
            setActivityItems([]);
          }
        }
      } catch {
        try {
          const backup = await axios.get(`http://localhost:3002/userActivity/${userId}`, { headers });
          setActivityItems(normalizeItems(backup.data));
        } catch {
          setActivityItems([]);
        }
      } finally {
        setActivityLoading(false);
      }
    };
    fetchActivity();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const firstRepoId =
      Array.isArray(repositories) && repositories.length > 0
        ? repositories[0]._id
        : null;
    const normalize = (data) => {
      const arr = Array.isArray(data) ? data : (data?.items || []);
      return arr.slice(0, 5).map((item) => {
        const user =
          item.author?.username ||
          item.username ||
          item.user?.username ||
          item.user ||
          "User";
        const files =
          item.files ||
          item.changedFiles ||
          item.addedFiles ||
          item.modifiedFiles ||
          item.deletedFiles ||
          [];
        const message =
          item.message ||
          item.commitMessage ||
          (Array.isArray(files) && files.length > 0
            ? `Updated ${files.length} files`
            : "Repository update");
        const when =
          item.timestamp ||
          item.pushedAt ||
          item.date ||
          new Date().toISOString();
        return {
          user,
          message,
          files: Array.isArray(files) ? files : [files].filter(Boolean),
          when,
        };
      });
    };
    const fetchCommits = async () => {
      setCommitLoading(true);
      setCommitError(null);
      try {
        if (firstRepoId) {
          const resp = await axios.get(
            `http://localhost:3002/repo/commits/${firstRepoId}`,
            { headers }
          );
          const normalized = normalize(resp.data);
          if (normalized.length > 0) {
            setCommitItems(normalized);
            return;
          }
        }
        const resp2 = await axios.get(
          `http://localhost:3002/activity/repoLogs/${firstRepoId || "all"}`,
          { headers }
        );
        setCommitItems(normalize(resp2.data));
      } catch (err) {
        setCommitError("Failed to load recent commits");
        setCommitItems([]);
      } finally {
        setCommitLoading(false);
      }
    };
    fetchCommits();
  }, [repositories]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const firstRepoId =
      Array.isArray(repositories) && repositories.length > 0
        ? repositories[0]._id
        : null;
    const normalize = (data) => {
      const arr = Array.isArray(data) ? data : (data?.items || []);
      return arr.slice(0, 5).map((item) => {
        const user =
          item.author?.username ||
          item.username ||
          item.user?.username ||
          item.user ||
          "User";
        const files =
          item.files ||
          item.changedFiles ||
          item.addedFiles ||
          item.modifiedFiles ||
          item.deletedFiles ||
          [];
        const message =
          item.message ||
          item.commitMessage ||
          (Array.isArray(files) && files.length > 0
            ? `Updated ${files.length} files`
            : "Repository update");
        const when =
          item.timestamp ||
          item.pushedAt ||
          item.date ||
          new Date().toISOString();
        return {
          user,
          message,
          files: Array.isArray(files) ? files : [files].filter(Boolean),
          when,
        };
      });
    };
    const interval = setInterval(async () => {
      try {
        if (firstRepoId) {
          const resp = await axios.get(
            `http://localhost:3002/repo/commits/${firstRepoId}`,
            { headers }
          );
          const normalized = normalize(resp.data);
          if (normalized.length > 0) {
            setCommitItems(normalized);
            return;
          }
        }
        const resp2 = await axios.get(
          `http://localhost:3002/activity/repoLogs/${firstRepoId || "all"}`,
          { headers }
        );
        setCommitItems(normalize(resp2.data));
      } catch {
        void 0;
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [repositories]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    if (!userId) return;
    const interval = setInterval(async () => {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const normalizeItems = (data) => {
        const arr = Array.isArray(data) ? data : (data?.items || []);
        const own = arr.filter((item) => {
          const uid = userId?.toString();
          const a =
            item.userId?.toString?.() ||
            item.authorId?.toString?.() ||
            item.actorId?.toString?.() ||
            item.user?.id?.toString?.();
          return uid && a && a === uid;
        });
        return own.slice(0, 3).map((item) => {
          const user =
            item.author?.username ||
            item.username ||
            item.user?.username ||
            item.user ||
            "User";
          const added = item.addedFiles || [];
          const modified = item.modifiedFiles || [];
          const deleted = item.deletedFiles || [];
          const files =
            item.files ||
            item.changedFiles ||
            [...added, ...modified, ...deleted];
          const when = item.timestamp || item.pushedAt || item.date || new Date().toISOString();
          return {
            user,
            summary: `Added ${added.length}, Modified ${modified.length}, Deleted ${deleted.length}`,
            files: Array.isArray(files) ? files : [files].filter(Boolean),
            when,
          };
        });
      };
      try {
        const resp = await axios.get(`http://localhost:3002/activity/pushLogs/${userId}`, { headers });
        const normalized = normalizeItems(resp.data);
        if (normalized.length > 0) {
          setActivityItems(normalized);
        } else {
          try {
            const backup = await axios.get(`http://localhost:3002/userActivity/${userId}`, { headers });
            setActivityItems(normalizeItems(backup.data));
          } catch {
            void 0;
          }
        }
      } catch {
        try {
          const backup = await axios.get(`http://localhost:3002/userActivity/${userId}`, { headers });
          setActivityItems(normalizeItems(backup.data));
        } catch {
          void 0;
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

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
                showStarButton={true}
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
              {activityLoading ? (
                <div className="loading-state">Loading activity...</div>
              ) : activityError ? (
                <div className="error-state">{activityError}</div>
              ) : activityItems.length === 0 ? (
                <div className="activity-list">
                  <div className="activity-item">
                    <p className="activity-text">No recent activity</p>
                  </div>
                </div>
              ) : (
                <div className="activity-list">
                  {activityItems.map((a, idx) => (
                    <div key={idx} className="activity-item">
                      <p className="activity-text"><span>User : </span> {a.user}</p>
                      <p className="activity-text"><span>Action : </span>{a.summary}</p>
                      <p className="activity-text"><span>Files : </span>{a.files.join(", ")}</p>
                      <p className="activity-text"><span>When : </span>{new Date(a.when).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="sidebar-section">
              <h3 className="sidebar-title">Recent commits</h3>
              {commitLoading ? (
                <div className="loading-state">Loading commits...</div>
              ) : commitError ? (
                <div className="error-state">{commitError}</div>
              ) : commitItems.length === 0 ? (
                <div className="activity-list">
                  <div className="activity-item">
                    <p className="activity-text">No commits yet</p>
                  </div>
                </div>
              ) : (
                <div className="activity-list">
                  {commitItems.map((c, i) => (
                    <div key={i} className="activity-item">
                      <p className="activity-text"><span>User : </span> {c.user}</p>
                      <p className="activity-text"><span>Commit : </span>{c.message}</p>
                      <p className="activity-text"><span>Files : </span>{c.files.join(", ")}</p>
                      <p className="activity-text"><span>When : </span>{new Date(c.when).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
