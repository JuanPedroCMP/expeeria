import { useState, useCallback } from 'react';

/**
 * Hook personalizado para gerenciar formulários
 * Facilita o controle de estados e validação de formulários
 * 
 * @param {Object} initialValues - Valores iniciais do formulário
 * @param {Function} validateFn - Função de validação opcional
 * @returns {Object} Métodos e estados para controle do formulário
 */
export const useForm = (initialValues = {}, validateFn) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Atualizar um campo específico
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => ({
      ...prev,
      [name]: fieldValue
    }));
    
    // Se campo foi tocado, validar em tempo real
    if (touched[name] && validateFn) {
      const fieldErrors = validateFn({
        ...values,
        [name]: fieldValue
      });
      
      setErrors(prev => ({
        ...prev,
        [name]: fieldErrors[name]
      }));
    }
  }, [values, touched, validateFn]);
  
  // Atualizar valor diretamente (para casos não vindos de eventos DOM)
  const setValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Se campo foi tocado, validar em tempo real
    if (touched[name] && validateFn) {
      const fieldErrors = validateFn({
        ...values,
        [name]: value
      });
      
      setErrors(prev => ({
        ...prev,
        [name]: fieldErrors[name]
      }));
    }
  }, [values, touched, validateFn]);
  
  // Marcar campo como tocado ao perder foco
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validar campo ao perder foco
    if (validateFn) {
      const fieldErrors = validateFn(values);
      
      setErrors(prev => ({
        ...prev,
        [name]: fieldErrors[name]
      }));
    }
  }, [values, validateFn]);
  
  // Manipular envio do formulário
  const handleSubmit = useCallback((submitFn) => {
    return async (e) => {
      e.preventDefault();
      
      // Marcar todos os campos como tocados
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      
      setTouched(allTouched);
      
      // Validar todos os campos
      let formErrors = {};
      if (validateFn) {
        formErrors = validateFn(values);
        setErrors(formErrors);
      }
      
      // Verificar se há erros
      const hasErrors = Object.values(formErrors).some(error => error);
      
      if (!hasErrors) {
        setIsSubmitting(true);
        try {
          await submitFn(values);
        } catch (error) {
          console.error('Erro ao enviar formulário:', error);
        } finally {
          setIsSubmitting(false);
        }
      }
    };
  }, [values, validateFn]);
  
  // Resetar formulário para valores iniciais
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValue
  };
};