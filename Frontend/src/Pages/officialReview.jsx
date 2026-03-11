import { useEffect, useState } from "react";
import axios from "axios";

function OfficialReview() {

  const [petitions, setPetitions] = useState([]);

  useEffect(() => {

    const fetchPetitions = async () => {

      const token = localStorage.getItem("accessToken");

      const res = await axios.get(
        "http://localhost:5000/api/petitions?myLocation=true",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setPetitions(res.data);

    };

    fetchPetitions();

  }, []);

  return (

    <div className="official-review">

      <h2>Petitions For Review</h2>

      {petitions.map((petition) => (

        <div key={petition._id} className="review-card">

          <h3>{petition.title}</h3>

          <p>{petition.description}</p>

          <p>Status: {petition.status}</p>

          <button>
            Open Petition
          </button>

        </div>

      ))}

    </div>

  );
}

export default OfficialReview;