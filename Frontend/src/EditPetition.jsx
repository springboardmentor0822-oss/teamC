import { useState, useEffect } from "react";
import "./CreatePetition.css";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function EditPetition() {

  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    signatureGoal: 100,
  });

  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("accessToken");

  /* ================= LOAD EXISTING PETITION ================= */

  useEffect(() => {

    const fetchPetition = async () => {

      try {

        const res = await axios.get(
          `http://localhost:5000/api/petitions/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const petition = res.data;

        setFormData({
          title: petition.title,
          category: petition.category,
          description: petition.description,
          signatureGoal: petition.signatureGoal,
        });

      } catch (error) {

        console.error(error);
        alert("Failed to load petition");

      }

    };

    fetchPetition();

  }, [id, token]);

  /* ================= HANDLE CHANGE ================= */

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  /* ================= UPDATE PETITION ================= */

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      await axios.put(
        `http://localhost:5000/api/petitions/${id}`,
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

      alert("Petition updated successfully!");
      navigate("/dashboard");

    } catch (error) {

      console.error(error);
      alert(error.response?.data?.message || "Error updating petition");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="create-petition-page">

      <div className="create-header">
        <h2>Edit Petition</h2>
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
              value={
                JSON.parse(
                  atob(
                    localStorage
                      .getItem("accessToken")
                      .split(".")[1]
                  )
                ).location
              }
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
            By updating this petition, you confirm that the information remains accurate and relevant.
          </p>

        </div>


        <button
          type="submit"
          className="submit-btn"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Petition"}
        </button>

      </form>

    </div>

  );

}

export default EditPetition;