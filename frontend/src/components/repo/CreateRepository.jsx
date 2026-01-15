import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import { useApp } from "../../contexts/AppContext";
import "./repo.css";

const CreateRepository = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [createdRepoId, setCreatedRepoId] = useState("");
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();
    const { refreshData } = useApp();

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      setCreatedRepoId("");
      setCopied(false);

      if (!name.trim()) {
        setError("Repository name is required");
        return;
      }

      // Validate repository name (GitHub-like rules)
      const nameRegex = /^[a-z0-9._-]+$/i;
      if (!nameRegex.test(name.trim())) {
        setError("Repository name can only contain alphanumeric characters, periods, hyphens, and underscores");
        return;
      }

      try {
        setLoading(true);
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        const response = await axios.post(
          "http://localhost:3002/repo/create",
          {
            owner: userId,
            name: name.trim(),
            description: description.trim(),
            visibility: visibility,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data) {
          const repo = response.data.repository || {};
          const newId = repo._id || response.data.repositoryID || "";
          if (newId) {
            setCreatedRepoId(newId);
          }
          await refreshData();
          setName("");
          setDescription("");
          setVisibility(true);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error creating repository:", err);
        setError(
          err.response?.data?.error || "Failed to create repository. Please try again."
        );
        setLoading(false);
      }
    };

    const handleCopyId = async () => {
      if (!createdRepoId) return;
      try {
        await navigator.clipboard.writeText(createdRepoId);
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (err) {
        console.error("Failed to copy repository ID:", err);
      }
    };

    return (
      <>
        <Navbar />
        <div className="create-repo-wrapper">
          <div className="create-repo-container">
            <div className="create-repo-header">
              <h1 className="create-repo-title">Create a new repository</h1>
              <p className="create-repo-subtitle">
                A repository contains all project files, including the revision history.
              </p>
            </div>

            {error && (
              <div className="error-message">
                <svg
                  aria-hidden="true"
                  height="16"
                  width="16"
                  viewBox="0 0 16 16"
                  fill="#f85149"
                  style={{ marginRight: "8px" }}
                >
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                {error}
              </div>
            )}

            {createdRepoId && (
              <div className="success-message">
                <div className="success-message-header">Repository created successfully</div>
                <div className="success-message-body">
                  <div className="repo-id-label">Repository ID</div>
                  <div className="repo-id-row">
                    <span className="repo-id-value">{createdRepoId}</span>
                    <button
                      type="button"
                      onClick={handleCopyId}
                      className="copy-id-button"
                    >
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <p className="repo-id-hint">
                    Use this ID in your CLI push commands.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="create-repo-form">
              <div className="form-group">
                <label htmlFor="name">
                  Repository name <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="repository-name"
                    required
                    disabled={loading}
                    className={error && !name.trim() ? "error" : ""}
                  />
                </div>
                <p className="input-hint">
                  Great repository names are short and memorable.
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description (optional)</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A short description of your repository"
                  rows="3"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="visibility"
                      checked={visibility}
                      onChange={() => setVisibility(true)}
                      disabled={loading}
                    />
                    <div className="radio-content">
                      <div className="radio-title">
                        <svg
                          aria-hidden="true"
                          height="16"
                          width="16"
                          viewBox="0 0 16 16"
                          fill="#8b949e"
                        >
                          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                        </svg>
                        Public
                      </div>
                      <p className="radio-description">
                        Anyone on the internet can see this repository.
                      </p>
                    </div>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="visibility"
                      checked={!visibility}
                      onChange={() => setVisibility(false)}
                      disabled={loading}
                    />
                    <div className="radio-content">
                      <div className="radio-title">
                        <svg
                          aria-hidden="true"
                          height="16"
                          width="16"
                          viewBox="0 0 16 16"
                          fill="#8b949e"
                        >
                          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                        </svg>
                        Private
                      </div>
                      <p className="radio-description">
                        You choose who can see and commit to this repository.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  disabled={loading}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="submit-btn"
                >
                  {loading ? (
                    <>
                      <span className="spinner-small"></span>
                      Creating...
                    </>
                  ) : (
                    "Create repository"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    );
  };

  export default CreateRepository;
