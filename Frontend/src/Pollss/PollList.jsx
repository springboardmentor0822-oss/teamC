import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import PollChart from "../Pollss/PollChart";
import "./PollList.css";

function PollList() {
  const [polls, setPolls] = useState([]);
  const [votedPolls, setVotedPolls] = useState([]);
  const [votingPoll, setVotingPoll] = useState(null);
  const [expandedCharts, setExpandedCharts] = useState({});
  const [activeTab, setActiveTab] = useState("explore");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingPollId, setDeletingPollId] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  const currentUser = token ? jwtDecode(token) : null;
  const currentUserId = currentUser?.id || currentUser?.sub || currentUser?._id;

  const loadPolls = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("http://localhost:5000/api/polls", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPolls(res.data);
    } catch (err) {
      console.error("Failed to load polls", err);
      setError("Couldn’t fetch polls. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (isMounted) {
        await loadPolls();
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [loadPolls]);

  const handleVote = async (pollId, option) => {
    try {
      setVotingPoll(pollId);
      await axios.post(
        `http://localhost:5000/api/polls/${pollId}/vote`,
        { option },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVotedPolls((prev) => [...prev, pollId]);
      loadPolls();
      setVotingPoll(null);
    } catch (error) {
      setVotingPoll(null);
      setError(error.response?.data?.message || "Voting failed.");
    }
  };

  const handleDelete = async (pollId) => {
    const ok = window.confirm(
      "Are you sure you want to delete this poll permanently?"
    );
    if (!ok) return;

    try {
      setDeletingPollId(pollId);
      await axios.delete(`http://localhost:5000/api/polls/${pollId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPolls((prev) => prev.filter((p) => p._id !== pollId));
    } catch (error) {
      setError(error.response?.data?.message || "Delete failed.");
    } finally {
      setDeletingPollId(null);
    }
  };

  useEffect(() => {
    const socket = io("http://localhost:5000", {
      auth: { token: localStorage.getItem("accessToken") },
    });
    socket.on("pollUpdated", (updatedPoll) => {
      setPolls((prev) =>
        prev.map((p) =>
          p._id === updatedPoll._id ? { ...p, ...updatedPoll } : p
        )
      );
    });
    return () => socket.disconnect();
  }, []);

  const getFilteredPolls = () => {
    let list = [...polls];
    if (searchTerm) {
      list = list.filter((p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (activeTab === "trending") {
      list.sort((a, b) => {
        const totalA = a.options.reduce((s, o) => s + o.votes, 0);
        const totalB = b.options.reduce((s, o) => s + o.votes, 0);
        return totalB - totalA;
      });
    } else if (activeTab === "my-polls") {
      list = list.filter((p) => p.createdBy === currentUserId);
    }
    return list;
  };

  const filteredPolls = getFilteredPolls();
  const totalPolls = polls.length;
  const activePolls = polls.filter(
    (p) => !p.expiresAt || new Date(p.expiresAt) > new Date()
  ).length;
  const totalVotes = polls.reduce(
    (sum, p) => sum + p.options.reduce((s, o) => s + o.votes, 0),
    0
  );

  return (
    <div className="poll-page">
      <div className="poll-header">
        <div className="header-main">
          <div>
            <h2>Community Polls</h2>
            <p className="header-subtitle">
              Vote on questions, discover insights, and share opinions with the community.
            </p>
          </div>
          <div className="header-right">
          
          <input
            type="text"
            placeholder="Search polls"
            className="search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
          <button
            className="create-poll-btn"
            onClick={() => navigate("/create-poll")}
            >
            + Create Poll
          </button>
        </div>
      </div>

      <div className="poll-tabs">
  <div className="tab-group">
    <button
      className={`tab ${activeTab === "explore" ? "active" : ""}`}
      onClick={() => setActiveTab("explore")}
    >
      All
    </button>
    <button
      className={`tab ${activeTab === "trending" ? "active" : ""}`}
      onClick={() => setActiveTab("trending")}
    >
      🔥 Trending
    </button>
    <button
      className={`tab ${activeTab === "my-polls" ? "active" : ""}`}
      onClick={() => setActiveTab("my-polls")}
    >
      My polls
    </button>
  </div>
</div>


      {/* Small “results dashboard” summary */}
      <div className="poll-summary">
        <div className="summary-card">
          <span className="summary-label">Total polls</span>
          <span className="summary-value">{totalPolls}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Active polls</span>
          <span className="summary-value">{activePolls}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Total votes</span>
          <span className="summary-value">{totalVotes}</span>
        </div>
      </div>

      <div className="poll-list">
        {loading && <div className="state-msg">Loading polls…</div>}

        {!loading && error && (
          <div className="state-msg error">
            {error}
            <button onClick={loadPolls} className="retry-btn">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredPolls.length === 0 && (
          <div className="state-msg">
            {searchTerm
              ? "No polls match your search."
              : "No polls yet. Start by creating your first poll."}
          </div>
        )}

        {!loading &&
          !error &&
          filteredPolls.map((poll) => {
            const totalVotesForPoll = poll.options.reduce(
              (sum, opt) => sum + opt.votes,
              0
            );
            const isExpired =
              poll.expiresAt && new Date(poll.expiresAt) < new Date();
            const isOwner = poll.createdBy === currentUserId;

            const closesText = isExpired
              ? "Closed"
              : poll.expiresAt
              ? `Ends on ${new Date(
                  poll.expiresAt
                ).toLocaleDateString()}`
              : "No end date";

            return (
              <div key={poll._id} className="poll-card">
                <div className="poll-card-header">
                  <div className="poll-info">
                    <div className="title-row">
                      <h3>{poll.title}</h3>
                      {isOwner && (
                        <button
                          className="delete-icon"
                          onClick={() => handleDelete(poll._id)}
                          disabled={deletingPollId === poll._id}
                          title="Delete Poll"
                        >
                          {deletingPollId === poll._id ? "…" : "🗑️"}
                        </button>
                      )}
                    </div>
                    <div className="poll-meta-row">
                      <span
                        className={`status-badge ${
                          !isExpired ? "live" : "closed"
                        }`}
                      >
                        {!isExpired ? "Live" : "Closed"}
                      </span>
                      <span className="meta-dot">.</span>
                      <span className="vote-count">
                        {totalVotesForPoll} votes
                      </span>
                      <span className="meta-dot">.</span>
                      <span className="vote-count">{closesText}</span>
                      {poll.target_location && (
                        <>
                        <span className="meta-dot">.</span>
                        <span className="vote-count">
                          📍 {poll.target_location}
                        </span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    className={`stats-toggle ${
                      expandedCharts[poll._id] ? "active" : ""
                    }`}
                    onClick={() =>
                      setExpandedCharts((prev) => ({
                        ...prev,
                        [poll._id]: !prev[poll._id],
                      }))
                    }
                  >
                    {expandedCharts[poll._id] ? "Hide stats" : "View Stats"}
                  </button>
                </div>

                <div
                  className={`chart-collapse ${
                    expandedCharts[poll._id] ? "open" : ""
                  }`}
                >
                  <PollChart options={poll.options} />
                </div>

                <div className="options-grid">
                  {poll.options.map((option) => {
                    const percent = totalVotesForPoll
                      ? Math.round((option.votes / totalVotesForPoll) * 100)
                      : 0;
                    const hasVoted =
                      poll.userVote || votedPolls.includes(poll._id);
                    const isUserSelection =
                      poll.userVote === option.text;

                    return (
                      <div
                        key={option.text}
                        className={`option-row ${
                          isUserSelection ? "user-voted" : ""
                        } ${!hasVoted && !isExpired ? "clickable" : ""}`}
                        onClick={() =>
                          !hasVoted &&
                          !isExpired &&
                          handleVote(poll._id, option.text)
                        }
                      >
                        <div className="option-content">
                          <div className="option-label">
                            <span>{option.text}</span>
                            <span className="pct-text">
                              {totalVotesForPoll
                                ? `${percent}%`
                                : "No votes yet"}
                            </span>
                          </div>
                          <div className="progress-bg">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${percent || 5}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        {!hasVoted && !isExpired && (
                          <button
                            className="mini-vote-btn"
                            disabled={votingPoll === poll._id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(poll._id, option.text);
                            }}
                          >
                            {votingPoll === poll._id
                              ? "Voting…"
                              : "Vote"}
                          </button>
                        )}

                        {isUserSelection && (
                          <span className="check-mark">✔</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default PollList;
