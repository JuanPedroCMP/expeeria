import React, { useState, useRef } from 'react';
import { useNotification } from '../../hooks/useNotification';
import { Button } from '../Button';
import styles from './UploadImage.module.css';
import { isValidImage, errorMessages } from '../../utils/validation';
import { uploadService } from '../../services/api';

export const UploadImage = ({
  onImageUpload,
  onUpload,
  initialImage = '',
  maxSizeMB = 5,
  aspectRatio,
  preview = true,
  label = 'Carregue uma imagem',
  preset = 'expeeria_cloud',
  previewStyle = {},
}) => {
  const [image, setImage] = useState(initialImage);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const { showError } = useNotification();
  const onUploadCallback = onImageUpload || onUpload;

  const aspectClass = {
    '1:1': styles.square,
    '16:9': styles.widescreen,
    '4:3': styles.standard,
  }[aspectRatio] || '';

  const handleFile = async (file) => {
    if (!file) return;
    if (!isValidImage(file, maxSizeMB)) {
      showError(errorMessages.image(maxSizeMB));
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setImage(localUrl);
    setLoading(true);

    try {
      const res = await uploadService.uploadImage(file, preset);
      onUploadCallback?.(res.secure_url);
    } catch (err) {
      showError('Erro ao enviar imagem. Usando local...');
      onUploadCallback?.(localUrl);
    } finally {
      setLoading(false);
    }
  };

  const openFileDialog = () => fileInputRef.current?.click();
  const clearImage = () => {
    setImage('');
    fileInputRef.current.value = '';
    onUploadCallback?.(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}

      <div
        className={`${styles.container} ${aspectClass} ${dragActive ? styles.dragActive : ''}`}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => handleFile(e.target.files?.[0])}
          className={styles.fileInput}
        />

        {image && preview ? (
          <div className={styles.previewContainer}>
            <img src={image} alt="Preview" className={styles.previewImage} style={previewStyle} />
            <div className={styles.overlay}>
              <Button size="sm" variant="outline" onClick={openFileDialog}>Alterar</Button>
              <Button size="sm" variant="danger" onClick={clearImage}>Remover</Button>
            </div>
          </div>
        ) : (
          <div className={styles.placeholder}>
            {loading ? (
              <p>Carregando...</p>
            ) : (
              <>
                <div className={styles.uploadIcon}>
                  <svg viewBox="0 0 24 24"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><line x1="16" y1="5" x2="22" y2="5"/><line x1="19" y1="2" x2="19" y2="8"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </div>
                <p>Arraste uma imagem ou clique</p>
                <Button size="sm" variant="outline" onClick={openFileDialog}>Selecionar arquivo</Button>
                <p className={styles.info}>Formatos: JPG, PNG, GIF, WebP | Máx: {maxSizeMB}MB</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
