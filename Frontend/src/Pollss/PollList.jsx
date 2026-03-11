// PollList.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./PollList.css";
import { io } from "socket.io-client";
import PollChart from "../Pollss/PollChart";

function PollList() {
  const [polls, setPolls] = useState([]);
  const [votedPolls, setVotedPolls] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const loadPolls = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/polls", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setPolls(res.data);
      } catch (error) {
        console.error("Failed to load polls", error);
      }
    };

    if (token) {
      loadPolls();
    }
  }, [token]);

  const handleVote = async (pollId, option) => {
    try {
      await axios.post(
        `http://localhost:5000/api/polls/${pollId}/vote`,
        { option },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setVotedPolls((prev) => [...prev, pollId]);

      const res = await axios.get("http://localhost:5000/api/polls", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setPolls(res.data);
    } catch (error) {
      alert(error.response?.data?.message || "Voting failed");
    }
  };

  useEffect(() => {
    const socket = io("http://localhost:5000", {
      auth: {
        token: localStorage.getItem("accessToken")
      }
    });

    socket.on("pollUpdated", (updatedPoll) => {
      setPolls((prevPolls) =>
        prevPolls.map((poll) =>
          poll._id === updatedPoll._id ? updatedPoll : poll
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="poll-page">
      <div className="poll-header">
        <div>
          <h2>Live Polls</h2>
          <p className="muted-text">
            Vote in active polls and watch results update in real time.
          </p>
        </div>

        <button
          className="create-poll-btn"
          onClick={() => navigate("/create-poll")}
        >
          + Create Poll
        </button>
      </div>

      <div className="poll-list">
        {polls.map((poll) => {
          const totalVotes = poll.options.reduce(
            (sum, opt) => sum + opt.votes,
            0
          );

          const isExpired =
            poll.expiresAt && new Date(poll.expiresAt) < new Date();

          return (
            <div key={poll._id} className="poll-card">
              <div className="poll-card-header">
                <div className="poll-title-area">
                  <h3>{poll.title}</h3>
                  {isExpired && (
                    <span className="expired-badge">Poll Closed</span>
                  )}
                </div>
                <div className="poll-meta">
                  <span className="poll-total-votes">
                    {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
                  </span>
                  {poll.expiresAt && (
                    <span className="poll-expiry-chip">
                      Expires:{" "}
                      {new Date(poll.expiresAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short"
                      })}
                    </span>
                  )}
                </div>
              </div>

              {poll.description && (
                <p className="poll-description">{poll.description}</p>
              )}

              <PollChart options={poll.options} />

              <div className="poll-options-group">
                {poll.options.map((option) => {
                  const percent = totalVotes
                    ? Math.round((option.votes / totalVotes) * 100)
                    : 0;

                  const disabled =
                    votedPolls.includes(poll._id) || isExpired;

                  return (
                    <div key={option.text} className="poll-option">
                      <div className="poll-option-top">
                        <span className="poll-option-label">
                          {option.text}
                        </span>
                        <span className="vote-percent">
                          {percent}%
                        </span>
                      </div>

                      <div className="poll-progress">
                        <div
                          className="poll-bar"
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      {!disabled && (
                        <button
                          className="vote-btn"
                          onClick={() =>
                            handleVote(poll._id, option.text)
                          }
                        >
                          Vote
                        </button>
                      )}

                      {disabled && !isExpired && (
                        <span className="already-voted-tag">
                          You voted in this poll
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {polls.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No polls yet</h3>
            <p>
              Create your first poll and share it with others to start
              collecting votes.
            </p>
            <button
              className="primary-cta"
              onClick={() => navigate("/create-poll")}
            >
              Create a Poll
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PollList;
