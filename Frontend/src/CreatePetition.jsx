import { useState } from "react";
import "./CreatePetition.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CreatePetition() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    signatureGoal: 100,
  });

  const [loading, setLoading] = useState(false);

  // ✅ FIXED handleChange
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const token = localStorage.getItem("accessToken");

      await axios.post(
        "http://localhost:5000/api/petitions",
        {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          signatureGoal: formData.signatureGoal,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Petition created successfully!");
      navigate("/dashboard");

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Error creating petition");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-petition-page">
      <div className="create-header">
        <h2>Create Petition</h2>
      </div>

      <form className="petition-form" onSubmit={handleSubmit}>

        <div className="form-group large">
  <label>Petition Title</label>
  <input
    type="text"
    name="title"
    placeholder="Give your petition a clear, specific title"
    value={formData.title}
    onChange={handleChange}
    required
  />
  <small className="helper-text">
    Choose a title that clearly states what change you want to see.
  </small>
</div>

<div className="form-row">
  <div className="form-group medium">
    <label>Category</label>
    <select
      name="category"
      value={formData.category}
      onChange={handleChange}
      required
    >
      <option value="">Select category</option>
      <option value="Infrastructure">Infrastructure</option>
      <option value="Health">Health</option>
      <option value="Education">Education</option>
      <option value="Environment">Environment</option>
      <option value="Other">Other</option>
    </select>
  </div>

  <div className="form-group medium">
    <label>Location</label>
    <input
      type="text"
      value={JSON.parse(atob(localStorage.getItem("accessToken").split(".")[1])).location}
      disabled
    />
    <small className="helper-text">
      The area this petition concerns.
    </small>
  </div>
</div>

<div className="form-group small">
  <label>Signature Goal</label>
  <input
    type="number"
    name="signatureGoal"
    value={formData.signatureGoal}
    onChange={handleChange}
    min="10"
    required
  />
  <small className="helper-text">
    How many signatures are you aiming to collect?
  </small>
</div>

<div className="form-group large">
  <label>Description</label>
  <textarea
    name="description"
    rows="6"
    placeholder="Describe the issue and the change you'd like to see..."
    value={formData.description}
    onChange={handleChange}
    required
  />
  <small className="helper-text">
    Clearly explain the issue, why it matters, and what specific action you're requesting.
  </small>
</div>

<div className="info-box">
  <strong>Important Information</strong>
  <p>
    By submitting this petition, you acknowledge that the content is factual to the best of your knowledge and does not contain misleading information. Civix reserves the right to remove petitions that violate our community guidelines.
  </p>
</div>

<button
  type="submit"
  className="submit-btn"
  disabled={loading}
>
  {loading ? "Submitting..." : "Submit Petition"}
</button>
      </form>
    </div>
  );
}

export default CreatePetition;