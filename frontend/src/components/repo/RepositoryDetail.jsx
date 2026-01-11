import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import { useApp } from "../../contexts/AppContext";
import "./repo.css";

const RepositoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleStar, starredRepoIds } = useApp();
  const [repository, setRepository] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);

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

  const handleStarClick = async () => {
    if (!repository) return;
    try {
      await toggleStar(repository._id);
    } catch (err) {
      console.error("Failed to toggle star:", err);
    }
  };

  const isStarred = repository && starredRepoIds.has(repository._id?.toString() || repository._id);

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
                <span className={`repo-visibility ${repository.visibility ? 'public' : 'private'}`}>
                  {repository.visibility ? 'Public' : 'Private'}
                </span>
              )}
            </div>
            <button
              className={`star-button ${isStarred ? 'starred' : ''}`}
              onClick={handleStarClick}
            >
              <svg
                className="star-icon"
                aria-hidden="true"
                height="16"
                width="16"
                viewBox="0 0 16 16"
                version="1.1"
              >
                <path
                  fill={isStarred ? '#f0f6fc' : 'none'}
                  stroke="#8b949e"
                  strokeWidth="1.5"
                  d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"
                />
              </svg>
              <span>{isStarred ? 'Starred' : 'Star'}</span>
            </button>
          </div>

          {repository.description && (
            <p className="repo-detail-description">{repository.description}</p>
          )}

          <div className="repo-detail-content">
            {repository.content && repository.content.length > 0 ? (
              <div className="repo-files-section">
                <h2>Files</h2>
                <ul className="repo-files-list">
                  {repository.content.map((file, index) => (
                    <li 
                      key={index} 
                      className="repo-file-item clickable"
                      onClick={() => handleFileClick(file)}
                    >
                      {file}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="repo-empty-state">
                <p>No files in this repository yet.</p>
              </div>
            )}

            {repository.issues && repository.issues.length > 0 && (
              <div className="repo-issues-section">
                <h2>Issues ({repository.issues.length})</h2>
                <ul className="repo-issues-list">
                  {repository.issues.map((issue) => (
                    <li key={issue._id || issue} className="repo-issue-item">
                      {typeof issue === 'object' ? issue.title || issue.description : issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="repo-detail-footer">
            <button onClick={() => navigate("/")} className="btn-secondary">
              ← Back to Dashboard
            </button>
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
