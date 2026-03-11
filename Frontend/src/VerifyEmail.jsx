import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function VerifyEmail() {

  const { token } = useParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState("Verifying email...");

  useEffect(() => {

    const verify = async () => {

      try {

        const res = await axios.get(
          `http://localhost:5000/api/auth/verify-email/${token}`
        );

        setMessage(res.data.message || "Email verified successfully");

        setTimeout(() => {
          navigate("/");
        }, 2000);

      } catch (error) {

        setMessage(
          error.response?.data?.message || "Verification failed"
        );

      }

    };

    verify();

  }, [token, navigate]);

  return (

    <div style={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "20px"
    }}>
      {message}
    </div>

  );

}

export default VerifyEmail;