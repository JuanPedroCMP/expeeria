/**
 * Utilitários de validação para formulários no Expeeria
 */

// Validação de email - simplificada para evitar erros de regex
export const isValidEmail = (email) => {
  if (!email) return false;
  
  // Limpar espaços extras
  email = email.trim();
  
  // Verificação mais simples que ainda funciona para a maioria dos casos
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  
  // Verificações adicionais básicas
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  
  // Verificar se tem um ponto no domínio
  const domainPart = parts[1];
  if (!domainPart.includes('.')) return false;
  
  return true;
};

/**
 * Valida um e-mail de maneira simplificada (para uso em tempo real durante digitação)
 * É menos rigorosa que a validação completa, mas útil para feedback imediato
 */
export const isValidEmailBasic = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validação de senha - simplificada para evitar erros
export const isStrongPassword = (password) => {
  // Versão simplificada - apenas verifica se tem pelo menos 6 caracteres
  return password && password.length >= 6;
};

// Validação de URL
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Validação de nome de usuário (alfanumérico com underline e hífen)
export const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

// Verificar campo obrigatório
export const isRequired = (value) => {
  return value !== undefined && value !== null && value.trim() !== '';
};

// Verificar comprimento mínimo
export const minLength = (value, min) => {
  return value && value.length >= min;
};

// Verificar comprimento máximo
export const maxLength = (value, max) => {
  return value && value.length <= max;
};

// Validar correspondência entre campos (ex: senha e confirmação)
export const matches = (value, matchValue) => {
  return value === matchValue;
};

// Validação de imagem (tipo e tamanho)
export const isValidImage = (file, maxSizeInMB = 5) => {
  if (!file) return false;
  
  // Verificar tipo
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const isValidType = validTypes.includes(file.type);
  
  // Verificar tamanho (converter MB para bytes)
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  const isValidSize = file.size <= maxSizeInBytes;
  
  return isValidType && isValidSize;
};

// Mensagens de erro padrão
export const errorMessages = {
  required: 'Este campo é obrigatório',
  email: 'Digite um endereço de email válido',
  password: 'A senha deve ter pelo menos 6 caracteres',
  passwordMatch: 'As senhas não correspondem',
  url: 'Digite uma URL válida',
  username: 'Nome de usuário deve ter entre 3 e 20 caracteres e conter apenas letras, números, underline e hífen',
  minLength: (min) => `Deve ter pelo menos ${min} caracteres`,
  maxLength: (max) => `Deve ter no máximo ${max} caracteres`,
  image: (maxSize) => `Arquivo deve ser uma imagem (JPG, PNG, GIF ou WebP) com tamanho máximo de ${maxSize}MB`,
};