import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [repositories, setRepositories] = useState([]);
  const [starredRepos, setStarredRepos] = useState([]);
  const [starredRepoIds, setStarredRepoIds] = useState(new Set());
  const [suggestedRepos, setSuggestedRepos] = useState([]);
  const [loading, setLoading] = useState({
    repos: false,
    starred: false,
    suggested: false,
  });
  const [error, setError] = useState({
    repos: null,
    starred: null,
    suggested: null,
  });
  const [userProfile, setUserProfile] = useState(null);
  const [following, setFollowing] = useState(new Set());
  const [followers, setFollowers] = useState(0);

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  // Fetch user repositories
  const fetchRepositories = useCallback(async () => {
    if (!userId) return;
    
    setLoading(prev => ({ ...prev, repos: true }));
    setError(prev => ({ ...prev, repos: null }));
    
    try {
      const response = await fetch(`http://localhost:3002/repo/user/${userId}`);
      const data = await response.json();
      setRepositories(data.repositories || []);
    } catch (err) {
      console.error('Error fetching repositories:', err);
      setError(prev => ({ ...prev, repos: 'Failed to load repositories' }));
      setRepositories([]);
    } finally {
      setLoading(prev => ({ ...prev, repos: false }));
    }
  }, [userId]);

  // Fetch starred repositories
  const fetchStarredRepos = useCallback(async () => {
    if (!userId) return;
    
    setLoading(prev => ({ ...prev, starred: true }));
    setError(prev => ({ ...prev, starred: null }));
    
    try {
      const response = await axios.get(
        `http://localhost:3002/starred/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const repos = response.data.repositories || [];
      setStarredRepos(repos);
      const ids = new Set(repos.map(repo => repo._id || repo.toString()));
      setStarredRepoIds(ids);
    } catch (err) {
      console.error('Error fetching starred repos:', err);
      setError(prev => ({ ...prev, starred: 'Failed to load starred repositories' }));
      setStarredRepos([]);
      setStarredRepoIds(new Set());
    } finally {
      setLoading(prev => ({ ...prev, starred: false }));
    }
  }, [userId, token]);

  // Fetch suggested repositories
  const fetchSuggestedRepos = useCallback(async () => {
    setLoading(prev => ({ ...prev, suggested: true }));
    setError(prev => ({ ...prev, suggested: null }));
    
    try {
      const response = await fetch('http://localhost:3002/repo/all');
      if (response.ok) {
        const data = await response.json();
        setSuggestedRepos(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching suggested repos:', err);
      setError(prev => ({ ...prev, suggested: 'Failed to load suggested repositories' }));
      setSuggestedRepos([]);
    } finally {
      setLoading(prev => ({ ...prev, suggested: false }));
    }
  }, []);

  // Fetch user profile
  const fetchUserProfile = useCallback(async (profileUserId = null) => {
    const targetUserId = profileUserId || userId;
    if (!targetUserId) return;
    
    try {
      const response = await axios.get(
        `http://localhost:3002/userProfile/${targetUserId}`
      );
      setUserProfile(response.data);
      
      // Fetch followers/following counts (if available)
      // This would need backend support
      setFollowers(response.data.followers || 0);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  }, [userId]);

  // Toggle star repository
  const toggleStar = useCallback(async (repoId) => {
    if (!userId || !token) return;
    
    const idString = repoId?.toString();
    const isStarred = starredRepoIds.has(idString);
    
    try {
      await axios.post(
        'http://localhost:3002/star',
        { userId, repoId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const newStarredIds = new Set(starredRepoIds);
      if (isStarred) {
        newStarredIds.delete(idString);
        setStarredRepos(prev =>
          prev.filter(repo => (repo._id?.toString() || repo._id) !== idString)
        );
      } else {
        newStarredIds.add(idString);
        const repo =
          suggestedRepos.find(r => (r._id?.toString() || r._id) === idString) ||
          repositories.find(r => (r._id?.toString() || r._id) === idString);
        if (repo) {
          setStarredRepos(prev => {
            const exists = prev.some(
              r => (r._id?.toString() || r._id) === idString
            );
            return exists ? prev : [...prev, repo];
          });
        } else {
          fetchStarredRepos();
        }
      }
      setStarredRepoIds(newStarredIds);
    } catch (err) {
      console.error('Error toggling star:', err);
      throw err;
    }
  }, [userId, token, starredRepoIds, suggestedRepos, repositories, fetchStarredRepos]);

  // Toggle follow user
  const toggleFollow = useCallback(async (targetUserId) => {
    if (!userId || !token) return;
    
    const isFollowing = following.has(targetUserId);
    
    try {
      await axios.post(
        'http://localhost:3002/follow',
        { userId, targetUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      const newFollowing = new Set(following);
      if (isFollowing) {
        newFollowing.delete(targetUserId);
        setFollowers(prev => Math.max(0, prev - 1));
      } else {
        newFollowing.add(targetUserId);
        setFollowers(prev => prev + 1);
      }
      setFollowing(newFollowing);
    } catch (err) {
      console.error('Error toggling follow:', err);
      // Update UI optimistically even on error
      const newFollowing = new Set(following);
      if (isFollowing) {
        newFollowing.delete(targetUserId);
        setFollowers(prev => Math.max(0, prev - 1));
      } else {
        newFollowing.add(targetUserId);
        setFollowers(prev => prev + 1);
      }
      setFollowing(newFollowing);
    }
  }, [userId, token, following]);

  // Refresh all data
  const refreshData = useCallback(() => {
    fetchRepositories();
    fetchStarredRepos();
    fetchSuggestedRepos();
    if (userId) {
      fetchUserProfile();
    }
  }, [fetchRepositories, fetchStarredRepos, fetchSuggestedRepos, fetchUserProfile, userId]);

  // Initial data fetch
  useEffect(() => {
    if (userId) {
      fetchRepositories();
      fetchStarredRepos();
      fetchSuggestedRepos();
      fetchUserProfile();
    }
  }, [userId, fetchRepositories, fetchStarredRepos, fetchSuggestedRepos, fetchUserProfile]);

  const value = {
    repositories,
    starredRepos,
    starredRepoIds,
    suggestedRepos,
    loading,
    error,
    userProfile,
    following,
    followers,
    fetchRepositories,
    fetchStarredRepos,
    fetchSuggestedRepos,
    fetchUserProfile,
    toggleStar,
    toggleFollow,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

