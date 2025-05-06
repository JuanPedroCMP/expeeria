import React, { useState } from "react";
import style from "./UploadImage.module.css"

const UploadImage = ({
  onUpload,
  preset = "expeeria_cloud",
  previewStyle = {},
}) => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [cloudUrl, setCloudUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setCloudUrl("");
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl("");
    }
  };

  const uploadImage = async () => {
    if (!image) return alert("Selecione uma imagem primeiro!");
    setLoading(true);
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", preset);

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/deepc0do7/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (data.secure_url) {
        setCloudUrl(data.secure_url);
        if (onUpload) onUpload(data.secure_url);
      } else {
        alert("Erro ao fazer upload. Tente outra imagem.");
      }
    } catch {
      alert("Erro ao fazer upload da imagem!");
    }
    setLoading(false);
  };

  const handleRemove = () => {
    setImage(null);
    setPreviewUrl("");
    setCloudUrl("");
    if (onUpload) onUpload("");
  };

  return (
    <div className={style.uploadBox}>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        disabled={!!cloudUrl || loading}
      />
      <button
        type="button"
        onClick={uploadImage}
        disabled={!image || !!cloudUrl || loading}
      >
        {loading ? "Enviando..." : "Upload"}
      </button>
      <button
        type="button"
        onClick={handleRemove}
        disabled={loading && !cloudUrl && !previewUrl}
        style={{ marginLeft: 8 }}
      >
        Remover
      </button>
      {(cloudUrl || previewUrl) && (
        <img src={cloudUrl || previewUrl} alt="Preview" style={previewStyle} />
      )}
    </div>
  );
};

export { UploadImage };
