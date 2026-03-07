import { useContext, useEffect, useState } from "react";

import api from "../api/axios.js";
import defaultAvatar from "../assets/default-avatar.png";
import Navbar from "../components/Navbar.js";
import Sidebar from "../components/Sidebar.js";
import { AuthContext } from "../context/AuthContext.js";
import "../styles/profile.css";

function Profile() {
  const { user, refreshProfile } = useContext(AuthContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState("");
  const [gender, setGender] = useState("");

  useEffect(() => {
    setGender(user?.gender || "");
  }, [user]);

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

  const handleProfileSave = async () => {
    try {
      await api.put("/auth/profile", { gender });
      await refreshProfile();
      setStatus("Profile updated");
      setIsEditing(false);
    } catch (_error) {
      setStatus("Unable to update profile");
    }
  };

  return (
    <main className="app-shell profile-container">
      <Sidebar />
      <section className="app-main">
        <Navbar />
        <section className="profile-card">
        <h2 className="profile-title">My Profile</h2>
        <div className="profile-hero">
          <img
            className="profile-avatar"
            src={user?.avatar ? `http://localhost:5000${user.avatar}` : defaultAvatar}
            alt="User avatar"
          />
          <div className="profile-actions">
            <button className="secondary-btn" type="button" onClick={() => setIsEditing((prev) => !prev)}>
              {isEditing ? "Cancel Edit" : "Edit Profile"}
            </button>
            <button className="upload-btn" type="button" onClick={handleUpload}>
              Change Photo
            </button>
          </div>
        </div>

        <div className="profile-info">
          <p><strong>Name:</strong> {user?.name || "-"}</p>
          <p><strong>Email:</strong> {user?.email || "-"}</p>
          <p><strong>Gender:</strong> {user?.gender || "-"}</p>
          <p><strong>Joined:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</p>
        </div>

        {isEditing ? (
          <div className="profile-info">
            <label htmlFor="gender-select"><strong>Gender:</strong></label>
            <select
              id="gender-select"
              value={gender}
              onChange={(event) => setGender(event.target.value)}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <button className="upload-btn" type="button" onClick={handleProfileSave}>
              Save Profile
            </button>
          </div>
        ) : null}

        <div className="file-upload">
          <input type="file" accept="image/*" onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} />
        </div>

        {status ? <p className="status-text">{status}</p> : null}
        </section>
      </section>
    </main>
  );
}

export default Profile;
