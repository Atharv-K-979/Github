import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Folder, TerminalSquare, FileCode2, Star } from "lucide-react";
import Navbar from "../Navbar";
import { useApp } from "../../contexts/AppContext";
import "./repo.css";

const RepositoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleStar, starredRepoIds, refreshData } = useApp();
  const [repository, setRepository] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [issueError, setIssueError] = useState("");
  const [issueLoading, setIssueLoading] = useState(false);
  const [localStarred, setLocalStarred] = useState(false);
  const [localStarCount, setLocalStarCount] = useState(0);
  const [commitLogs, setCommitLogs] = useState([]);
  const [commitLoading, setCommitLoading] = useState(false);
  const [commitError, setCommitError] = useState(null);

  useEffect(() => {
    const fetchRepository = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3002/repo/${id}`);
        console.log("Repository data received:", response.data);
        // Handle both array and object responses
        const repoData = Array.isArray(response.data) ? response.data[0] : response.data;
        console.log("Content array:", repoData?.content);
        setRepository(repoData);
        const repoIdString = repoData?._id?.toString() || repoData?._id;
        const initialStarred = repoIdString ? starredRepoIds.has(repoIdString) : false;
        setLocalStarred(initialStarred);
        const initialCount = typeof repoData?.stargazers_count === "number" ? repoData.stargazers_count : 0;
        setLocalStarCount(initialCount);
      } catch (err) {
        console.error("Error fetching repository:", err);
        setError(err.response?.status === 404 ? "Repository not found" : "Failed to load repository");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRepository();
    }
  }, [id]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setCommitLoading(true);
        setCommitError(null);
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        let resp = await axios.get(`http://localhost:3002/repo/commits/${id}`, { headers });
        let data = Array.isArray(resp.data) ? resp.data : (resp.data?.items || []);
        if (!Array.isArray(data) || data.length === 0) {
          resp = await axios.get(`http://localhost:3002/activity/repoLogs/${id}`, { headers });
          data = Array.isArray(resp.data) ? resp.data : (resp.data?.items || []);
          if (!Array.isArray(data) || data.length === 0) {
            const userId = localStorage.getItem("userId");
            try {
              const userResp = await axios.get(`http://localhost:3002/userActivity/${userId}`, { headers });
              const arr = Array.isArray(userResp.data) ? userResp.data : (userResp.data?.items || []);
              data = arr.filter((item) => {
                const rid =
                  item.repoId?.toString?.() ||
                  item.repositoryId?.toString?.();
                const rname =
                  item.repo ||
                  item.repository ||
                  item.repoName;
                const idStr = id?.toString();
                return (rid && idStr && rid === idStr) || (!!rname && !!repository?.name && rname === repository.name);
              });
            } catch {
              data = [];
            }
          }
        }
        const normalized = data.slice(0, 10).map((item) => {
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
            (Array.isArray(files) && files.length > 0 ? `Updated ${files.length} files` : "Repository update");
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
        setCommitLogs(normalized);
      } catch (e) {
        setCommitError("Failed to load commits");
        setCommitLogs([]);
      } finally {
        setCommitLoading(false);
      }
    };
    if (id) {
      fetchLogs();
    }
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!id) return;
    const interval = setInterval(async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const resp = await axios.get(`http://localhost:3002/repo/commits/${id}`, { headers });
        const data = Array.isArray(resp.data) ? resp.data : (resp.data?.items || []);
        const normalized = data.slice(0, 10).map((item) => {
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
            (Array.isArray(files) && files.length > 0 ? `Updated ${files.length} files` : "Repository update");
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
        setCommitLogs(normalized);
      } catch {
        void 0;
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const handleStarClick = async () => {
    if (!repository) return;
    const repoId = repository._id;
    const nextStarred = !localStarred;
    const delta = nextStarred ? 1 : -1;
    setLocalStarred(nextStarred);
    setLocalStarCount((prev) => Math.max(0, prev + delta));
    try {
      await toggleStar(repoId);
    } catch (err) {
      console.error("Failed to toggle star:", err);
      // Keep optimistic state; backend will catch up once available
    }
  };

  const isStarred = localStarred;

  const getFileTypeIcon = (name) => {
    if (!name) return <FileCode2 className="file-type-icon" />;
    if (name.endsWith(".bat") || name.endsWith(".sh")) {
      return <TerminalSquare className="file-type-icon" />;
    }
    const hasExtension = name.includes(".");
    if (!hasExtension) {
      return <Folder className="file-type-icon" />;
    }
    return <FileCode2 className="file-type-icon" />;
  };

  const getFileAge = () => {
    if (!repository?.updatedAt && !repository?.createdAt) return "Just now";
    const reference = new Date(repository.updatedAt || repository.createdAt);
    const diffMs = Date.now() - reference.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks === 1) return "1 week ago";
    if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return "1 month ago";
    return `${diffMonths} months ago`;
  };

  const handleFileClick = async (filename) => {
    try {
      setLoadingFile(true);
      setSelectedFile(filename);
      const response = await axios.get(`http://localhost:3002/repo/${id}/file/${filename}`);
      setFileContent(response.data.content);
    } catch (err) {
      console.error("Error fetching file content:", err);
      setFileContent("Error loading file content");
    } finally {
      setLoadingFile(false);
    }
  };

  const closeFileViewer = () => {
    setSelectedFile(null);
    setFileContent(null);
  };

  const handleDeleteRepository = async () => {
    if (!repository || actionLoading) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this repository? This action cannot be undone."
    );
    if (!confirmDelete) return;
    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3002/repo/delete/${repository._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await refreshData();
      navigate("/");
    } catch (err) {
      console.error("Error deleting repository:", err);
      setError("Failed to delete repository. Please try again.");
      setActionLoading(false);
    }
  };

  const handleToggleVisibility = async () => {
    if (!repository || actionLoading) return;
    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `http://localhost:3002/repo/toggle/${repository._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data && response.data.repository) {
        setRepository(response.data.repository);
      }
    } catch (err) {
      console.error("Error toggling visibility:", err);
      setError("Failed to toggle repository visibility.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!issueTitle.trim() || !issueDescription.trim() || issueLoading) {
      return;
    }
    try {
      setIssueError("");
      setIssueLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:3002/issue/create",
        {
          title: issueTitle.trim(),
          description: issueDescription.trim(),
          repository: repository._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        const newIssue = response.data;
        setRepository((prev) =>
          prev
            ? {
                ...prev,
                issues: [...(prev.issues || []), newIssue],
              }
            : prev
        );
        setIssueTitle("");
        setIssueDescription("");
      }
    } catch (err) {
      console.error("Error creating issue:", err);
      setIssueError("Failed to create issue. Please try again.");
    } finally {
      setIssueLoading(false);
    }
  };

  const handleToggleIssueStatus = async (issue) => {
    if (!issue || actionLoading) return;
    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      const newStatus = issue.status === "closed" ? "open" : "closed";
      const response = await axios.put(
        `http://localhost:3002/issue/update/${issue._id}`,
        {
          title: issue.title,
          description: issue.description,
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data && response.data.issue) {
        const updatedIssue = response.data.issue;
        setRepository((prev) =>
          prev
            ? {
                ...prev,
                issues: (prev.issues || []).map((item) =>
                  item._id === updatedIssue._id ? updatedIssue : item
                ),
              }
            : prev
        );
      }
    } catch (err) {
      console.error("Error updating issue:", err);
      setError("Failed to update issue status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteIssue = async (issueId) => {
    if (!issueId || actionLoading) return;
    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3002/issue/delete/${issueId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRepository((prev) =>
        prev
          ? {
              ...prev,
              issues: (prev.issues || []).filter(
                (item) => (item._id || item) !== issueId
              ),
            }
          : prev
      );
    } catch (err) {
      console.error("Error deleting issue:", err);
      setError("Failed to delete issue.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="repo-detail-wrapper">
          <div className="repo-detail-container">
            <p>Loading repository...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !repository) {
    return (
      <>
        <Navbar />
        <div className="repo-detail-wrapper">
          <div className="repo-detail-container">
            <div className="error-message">
              <p>{error || "Repository not found"}</p>
              <button onClick={() => navigate("/")} className="btn-primary">
                Go Back
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="repo-detail-wrapper">
        <div className="repo-detail-container">
          <div className="repo-breadcrumb">
            <button
              type="button"
              className="breadcrumb-link"
              onClick={() => navigate("/")}
            >
              Dashboard
            </button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{repository.name}</span>
          </div>

          <div className="repo-detail-header">
            <div className="repo-detail-title-section">
              <h1 className="repo-detail-name">
                {repository.owner?.username && (
                  <>
                    <span className="repo-owner">{repository.owner.username}</span>
                    <span className="repo-separator">/</span>
                  </>
                )}
                {repository.name}
              </h1>
              {repository.visibility !== undefined && (
                <span className={`repo-visibility ${repository.visibility ? "public" : "private"}`}>
                  {repository.visibility ? "Public" : "Private"}
                </span>
              )}
            </div>
            <div className="repo-header-actions">
              <button
                type="button"
                className={`star-toggle ${isStarred ? "starred" : ""}`}
                onClick={handleStarClick}
                disabled={actionLoading}
              >
                <Star
                  className="star-toggle-icon"
                  fill={isStarred ? "#facc15" : "none"}
                  stroke={isStarred ? "#facc15" : "#8b949e"}
                />
                <span className="star-toggle-label">
                  {isStarred ? "Starred" : "Star"}
                </span>
                <span className="star-toggle-count">{localStarCount}</span>
              </button>
              <button
                className="visibility-toggle-button"
                onClick={handleToggleVisibility}
                disabled={actionLoading}
              >
                {repository.visibility ? "Make private" : "Make public"}
              </button>
              <button
                className="danger-button"
                onClick={handleDeleteRepository}
                disabled={actionLoading}
              >
                Delete
              </button>
            </div>
          </div>

          <div className="repo-layout-grid">
            <div className="repo-main-column">
              <div className="repo-file-header-bar">
                <div className="file-branch">
                  <span className="file-branch-label">Branch:</span>
                  <span className="file-branch-value">main</span>
                </div>
                <div className="file-commit-summary">
                  <span className="file-commit-message">
                    Latest commit: placeholder summary
                  </span>
                  <span className="file-commit-hash">
                    0000000
                  </span>
                </div>
              </div>

              <div className="repo-files-card">
                <div className="repo-files-table-header">
                  <div className="repo-files-col-name">Name</div>
                  <div className="repo-files-col-commit">Commit message</div>
                  <div className="repo-files-col-age">Age</div>
                </div>
                {repository.content && repository.content.length > 0 ? (
                  <div className="repo-files-table-body">
                    {repository.content.map((file, index) => (
                      <button
                        key={index}
                        type="button"
                        className="repo-files-row"
                        onClick={() => handleFileClick(file)}
                      >
                        <div className="repo-files-cell-name">
                          {getFileTypeIcon(file)}
                          <span className="file-name-text">{file}</span>
                        </div>
                        <div className="repo-files-cell-commit">
                          Initial commit
                        </div>
                        <div className="repo-files-cell-age">
                          {getFileAge()}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="repo-empty-state">
                    <p>No files in this repository yet.</p>
                  </div>
                )}
              </div>

              <div className="repo-activity-card">
                <div className="repo-activity-header">
                  <h2 className="repo-activity-title">Recent commits</h2>
                </div>
                {commitLoading ? (
                  <div className="repo-empty-state">
                    <p>Loading commits...</p>
                  </div>
                ) : commitError ? (
                  <div className="error-message">
                    <p>{commitError}</p>
                  </div>
                ) : commitLogs.length === 0 ? (
                  <div className="repo-empty-state">
                    <p>No commits yet.</p>
                  </div>
                ) : (
                  <div className="repo-activity-list">
                    {commitLogs.map((c, i) => (
                      <div key={i} className="repo-activity-item">
                        <p className="repo-activity-line">User: {c.user}</p>
                        <p className="repo-activity-line">Commit: {c.message}</p>
                        <p className="repo-activity-line">Files: {c.files.join(", ")}</p>
                        <p className="repo-activity-line">When: {new Date(c.when).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="repo-readme-card">
                <div className="repo-readme-header">
                  <h2 className="repo-readme-title">README.md</h2>
                </div>
                <div className="repo-readme-body">
                  <p className="repo-readme-placeholder">
                    No README.md found for this repository. Use your first commit to
                    add a README and describe your project, setup steps, and usage.
                  </p>
                </div>
              </div>
            </div>

            <aside className="repo-side-column">
              <div className="repo-meta-card">
                <h3 className="repo-meta-title">About</h3>
                <p className="repo-meta-description">
                  {repository.description || "No description provided."}
                </p>
              </div>

              <div className="repo-meta-card">
                <h3 className="repo-meta-title">Languages</h3>
                <p className="repo-meta-muted">Language data not available.</p>
              </div>

              <div className="repo-meta-card">
                <h3 className="repo-meta-title">Statistics</h3>
                <div className="repo-meta-stat-row">
                  <span className="repo-meta-stat-label">Stars</span>
                  <span className="repo-meta-stat-value">{localStarCount}</span>
                </div>
                <div className="repo-meta-stat-row">
                  <span className="repo-meta-stat-label">Forks</span>
                  <span className="repo-meta-stat-value">0</span>
                </div>
              </div>

              <div className="repo-meta-card">
                <h3 className="repo-meta-title">
                  Issues
                  {repository.issues && repository.issues.length > 0
                    ? ` (${repository.issues.length})`
                    : ""}
                </h3>
                {repository.issues && repository.issues.length > 0 ? (
                  <ul className="repo-issues-list">
                    {repository.issues.map((issue) => (
                      <li key={issue._id || issue} className="repo-issue-item">
                        {typeof issue === "object" ? (
                          <div className="issue-item-content">
                            <div className="issue-main">
                              <span className="issue-title">{issue.title}</span>
                              <span
                                className={`issue-status ${
                                  issue.status === "closed" ? "closed" : "open"
                                }`}
                              >
                                {issue.status === "closed" ? "Closed" : "Open"}
                              </span>
                            </div>
                            <p className="issue-description">{issue.description}</p>
                            <div className="issue-actions">
                              <button
                                type="button"
                                className="issue-toggle-button"
                                onClick={() => handleToggleIssueStatus(issue)}
                                disabled={actionLoading}
                              >
                                {issue.status === "closed" ? "Reopen" : "Close"}
                              </button>
                              <button
                                type="button"
                                className="issue-delete-button"
                                onClick={() => handleDeleteIssue(issue._id)}
                                disabled={actionLoading}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          issue
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="repo-empty-state">
                    <p>No issues for this repository yet.</p>
                  </div>
                )}
              </div>

              <form className="issue-form" onSubmit={handleCreateIssue}>
                <h3 className="issue-form-title">Create a new issue</h3>
                {issueError && <div className="error-message">{issueError}</div>}
                <div className="issue-form-row">
                  <input
                    type="text"
                    placeholder="Issue title"
                    value={issueTitle}
                    onChange={(e) => setIssueTitle(e.target.value)}
                    disabled={issueLoading}
                    className="issue-input"
                  />
                </div>
                <div className="issue-form-row">
                  <textarea
                    placeholder="Describe the issue"
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    disabled={issueLoading}
                    rows={3}
                    className="issue-textarea"
                  />
                </div>
                <div className="issue-form-actions">
                  <button
                    type="submit"
                    className="issue-submit-button"
                    disabled={
                      issueLoading ||
                      !issueTitle.trim() ||
                      !issueDescription.trim()
                    }
                  >
                    {issueLoading ? "Creating..." : "Create issue"}
                  </button>
                </div>
              </form>
            </aside>
          </div>
        </div>
      </div>

      {/* File Content Modal */}
      {selectedFile && (
        <div className="file-modal-overlay" onClick={closeFileViewer}>
          <div className="file-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="file-modal-header">
              <h3 className="file-modal-title">{selectedFile}</h3>
              <button className="file-modal-close" onClick={closeFileViewer}>
                ×
              </button>
            </div>
            <div className="file-modal-body">
              {loadingFile ? (
                <p>Loading file content...</p>
              ) : (
                <pre className="file-content">{fileContent}</pre>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RepositoryDetail;
