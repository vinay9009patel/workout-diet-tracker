import { useContext, useState } from "react";

import api from "../api/axios.js";
import defaultAvatar from "../assets/default-avatar.png";
import Navbar from "../components/Navbar.js";
import { AuthContext } from "../context/AuthContext.js";
import "../styles/profile.css";

function Profile() {
  const { user, refreshProfile } = useContext(AuthContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleUpload = async () => {
    if (!selectedFile) {
      setStatus("Please select an image file");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", selectedFile);

    try {
      await api.post("/auth/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await refreshProfile();
      setStatus("Avatar uploaded");
      setSelectedFile(null);
    } catch (_error) {
      setStatus("Avatar upload failed");
    }
  };

  return (
    <main className="profile-container">
      <Navbar />
      <section className="profile-card">
        <h2 className="profile-title">Profile</h2>
        <img
          className="profile-avatar"
          src={user?.avatar ? `http://localhost:5000${user.avatar}` : defaultAvatar}
          alt="User avatar"
        />

        <div className="profile-info">
          <p><strong>Name:</strong> {user?.name || "-"}</p>
          <p><strong>Email:</strong> {user?.email || "-"}</p>
          <p><strong>Member since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</p>
        </div>

        <div className="file-upload">
          <input type="file" accept="image/*" onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} />
          <button className="upload-btn" type="button" onClick={handleUpload}>
            Upload Avatar
          </button>
        </div>

        {status ? <p className="status-text">{status}</p> : null}
      </section>
    </main>
  );
}

export default Profile;
