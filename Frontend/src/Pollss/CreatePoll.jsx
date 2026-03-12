import { useState } from "react";
import axios from "axios";
import "./CreatePoll.css";
import { useNavigate } from "react-router-dom";

function CreatePoll() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [expiresAt, setExpiresAt] = useState("");
  const [targetLocation, setTargetLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOption = () => {
    if (options.length >= 6) return;
    setOptions([...options, ""]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedOptions = options
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    if (!trimmedTitle) {
      alert("Poll question is required.");
      return;
    }

    if (trimmedOptions.length < 2) {
      alert("Please provide at least 2 options.");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("accessToken");

      await axios.post(
        "http://localhost:5000/api/polls",
        {
          title: trimmedTitle,
          description,
          options: trimmedOptions,
          expiresAt,
          target_location: targetLocation.trim() || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Poll created successfully");
      navigate("/polls");
    } catch (error) {
      alert(error.response?.data?.message || "Error creating poll");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-poll-page">
      <div className="create-poll-card">
        <div className="create-poll-header">
          <h2>Create Poll</h2>
          <p>Ask a question, add options and set an expiry for your poll.</p>
        </div>

        <form onSubmit={handleSubmit} className="poll-form">
          <div className="form-group">
            <label>Poll Question</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. What feature should we build next?"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional context for voters..."
            />
          </div>

          <div className="form-group">
            <label>Target Location (optional)</label>
            <input
              type="text"
              value={targetLocation}
              onChange={(e) => setTargetLocation(e.target.value)}
              placeholder="e.g. San Diego, CA"
            />
          </div>

          <div className="form-group inline-group">
            <div className="inline-field">
              <label>Poll Expiry</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
            <div className="inline-hint">
              <span>Tip: Leave empty for no expiry.</span>
            </div>
          </div>

          <div className="form-group">
            <label>Options</label>
            <div className="options-list">
              {options.map((option, index) => (
                <div key={index} className="option-row">
                  <span className="option-index">{index + 1}</span>
                  <input
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) =>
                      handleOptionChange(index, e.target.value)
                    }
                    required
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addOption}
              className="add-option-btn"
              disabled={options.length >= 6}
            >
              + Add Option
            </button>
            <p className="field-hint">You can add up to 6 options.</p>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate("/polls")}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? "Creating…" : "Create Poll"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePoll;
