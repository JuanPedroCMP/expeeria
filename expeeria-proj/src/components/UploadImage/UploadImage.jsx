import React, { useState, useRef } from 'react';
import { useNotification } from '../../hooks/useNotification';
import { Button } from '../Button';
import styles from './UploadImage.module.css';
import { isValidImage, errorMessages } from '../../utils/validation';

/**
 * Componente para upload de imagens com funcionalidades avançadas
 * @param {Object} props - Propriedades do componente
 * @param {Function} props.onImageUpload - Função chamada quando a imagem é carregada
 * @param {string} [props.initialImage] - URL da imagem inicial (se existir)
 * @param {number} [props.maxSizeMB=5] - Tamanho máximo da imagem em MB
 * @param {string} [props.aspectRatio] - Proporção esperada da imagem ('1:1', '16:9', '4:3')
 * @param {boolean} [props.preview=true] - Se deve mostrar pré-visualização
 * @param {string} [props.label] - Texto de rótulo para o upload
 */
export const UploadImage = ({
  onImageUpload,
  initialImage = '',
  maxSizeMB = 5,
  aspectRatio,
  preview = true,
  label = 'Carregue uma imagem',
}) => {
  const [image, setImage] = useState(initialImage);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const { showError } = useNotification();

  // Determinar a classe para o contêiner de acordo com o aspectRatio
  const getContainerClass = () => {
    if (!aspectRatio) return styles.container;
    
    switch (aspectRatio) {
      case '1:1':
        return `${styles.container} ${styles.square}`;
      case '16:9':
        return `${styles.container} ${styles.widescreen}`;
      case '4:3':
        return `${styles.container} ${styles.standard}`;
      default:
        return styles.container;
    }
  };

  // Verificar e processar o arquivo de imagem
  const processFile = async (file) => {
    if (!file) return;
    
    setIsLoading(true);
    
    try {
      // Validar o tipo e tamanho da imagem
      if (!isValidImage(file, maxSizeMB)) {
        showError(errorMessages.image(maxSizeMB));
        return;
      }
      
      // Criar URL temporária para pré-visualização
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      
      // Passar o arquivo para o componente pai
      if (onImageUpload) {
        onImageUpload(file, imageUrl);
      }
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      showError('Falha ao processar a imagem. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Manipular clique no botão de upload
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Manipular alteração no input de arquivo
  const handleChange = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  // Manipular arrastar para dentro da área
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  // Manipular arrastar para fora da área
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  // Manipular soltar arquivo na área
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Manipular evento de arrastar sobre a área
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Remover a imagem atual
  const handleRemove = () => {
    setImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageUpload) {
      onImageUpload(null);
    }
  };

  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}
      
      <div
        className={`${getContainerClass()} ${dragActive ? styles.dragActive : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Input de arquivo oculto */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleChange}
          accept="image/jpeg,image/png,image/gif,image/webp"
          className={styles.fileInput}
        />
        
        {/* Área de pré-visualização */}
        {preview && image ? (
          <div className={styles.previewContainer}>
            <img
              src={image}
              alt="Pré-visualização"
              className={styles.previewImage}
            />
            <div className={styles.overlay}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClick}
                className={styles.overlayButton}
              >
                Alterar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleRemove}
                className={styles.overlayButton}
              >
                Remover
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.placeholder}>
            {isLoading ? (
              <p>Carregando...</p>
            ) : (
              <>
                <div className={styles.uploadIcon}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                    <line x1="16" y1="5" x2="22" y2="5" />
                    <line x1="19" y1="2" x2="19" y2="8" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                </div>
                <p>Arraste uma imagem ou clique para carregar</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClick}
                >
                  Selecionar arquivo
                </Button>
                <p className={styles.info}>
                  Arquivos suportados: JPG, PNG, GIF, WebP
                  <br />
                  Tamanho máximo: {maxSizeMB}MB
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
