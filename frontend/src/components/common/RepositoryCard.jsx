import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import './RepositoryCard.css';

const RepositoryCard = ({ repo, showStarButton = true, showOwner = false }) => {
  const navigate = useNavigate();
  const { toggleStar, starredRepoIds } = useApp();
  const repoId = repo._id?.toString() || repo._id;
  const isStarred = starredRepoIds.has(repoId);

  const handleStarClick = async (e) => {
    e.stopPropagation();
    try {
      await toggleStar(repoId);
    } catch (err) {
      console.error('Failed to toggle star:', err);
    }
  };

  const handleCardClick = () => {
    navigate(`/repo/${repo._id}`);
  };

  return (
    <div className="repo-card" onClick={handleCardClick}>
      <div className="repo-card-header">
        <div className="repo-card-title-section">
          <h3 className="repo-card-name">
            {showOwner && repo.owner?.username ? (
              <>
                <span className="repo-owner">{repo.owner.username}</span>
                <span className="repo-separator">/</span>
              </>
            ) : null}
            {repo.name}
          </h3>
          {repo.visibility !== undefined && (
            <span className={`repo-visibility ${repo.visibility ? 'public' : 'private'}`}>
              {repo.visibility ? 'Public' : 'Private'}
            </span>
          )}
        </div>
        {showStarButton && (
          <button
            className={`star-button ${isStarred ? 'starred' : ''}`}
            onClick={handleStarClick}
            aria-label={isStarred ? 'Unstar repository' : 'Star repository'}
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
        )}
      </div>
      {repo.description && (
        <p className="repo-card-description">{repo.description}</p>
      )}
      <div className="repo-card-footer">
        {repo.language && (
          <span className="repo-language">
            <span className="language-color"></span>
            {repo.language}
          </span>
        )}
        {repo.stargazers_count !== undefined && (
          <span className="repo-stars">
            <svg aria-hidden="true" height="16" width="16" viewBox="0 0 16 16">
              <path
                fill="#8b949e"
                d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"
              />
            </svg>
            {repo.stargazers_count}
          </span>
        )}
        {repo.updated_at && (
          <span className="repo-updated">
            Updated {new Date(repo.updated_at).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default RepositoryCard;

