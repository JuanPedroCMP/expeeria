/**
 * Utilitários de validação para formulários no Expeeria
 */

// Validação de email
export const isValidEmail = (email) => {
  if (!email) return false;
  
  // Limpar espaços extras
  email = email.trim();
  
  // Regex melhorada para validação de email que suporta subdomínios múltiplos (.sp.gov, .co.uk, etc)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  // Verificação básica com regex
  if (!emailRegex.test(email)) return false;
  
  // Verificações adicionais
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  
  // Verificar parte local (antes do @)
  const localPart = parts[0];
  if (localPart.length === 0 || localPart.length > 64) return false;
  
  // Verificar domínio (após o @)
  const domainPart = parts[1];
  if (domainPart.length === 0 || domainPart.length > 255 || !domainPart.includes('.')) return false;
  
  // Verificar se o TLD tem pelo menos 2 caracteres
  const tld = domainPart.split('.').pop();
  if (tld.length < 2) return false;
  
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

// Validação de senha forte
export const isStrongPassword = (password) => {
  // Pelo menos 8 caracteres, uma letra maiúscula, uma minúscula, um número
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return strongPasswordRegex.test(password);
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
  password: 'A senha deve ter pelo menos 8 caracteres, incluindo letra maiúscula, minúscula e número',
  passwordMatch: 'As senhas não correspondem',
  url: 'Digite uma URL válida',
  username: 'Nome de usuário deve ter entre 3 e 20 caracteres e conter apenas letras, números, underline e hífen',
  minLength: (min) => `Deve ter pelo menos ${min} caracteres`,
  maxLength: (max) => `Deve ter no máximo ${max} caracteres`,
  image: (maxSize) => `Arquivo deve ser uma imagem (JPG, PNG, GIF ou WebP) com tamanho máximo de ${maxSize}MB`,
};