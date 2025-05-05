import React, { useState } from "react";
import axios from "axios";

const UploadImage = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const uploadImage = async () => {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "SEU_UPLOAD_PRESET"); // configure no Cloudinary
    formData.append("cloud_name", "SEU_CLOUD_NAME");

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/SEU_CLOUD_NAME/image/upload",
        formData
      );
      setPreviewUrl(res.data.secure_url);
    } catch (err) {
      console.error("Erro ao fazer upload:", err);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleImageChange} />
      <button onClick={uploadImage}>Upload</button>
      {previewUrl && (
        <img src={previewUrl} alt="Uploaded" style={{ width: 300 }} />
      )}
    </div>
  );
};

export { UploadImage };
