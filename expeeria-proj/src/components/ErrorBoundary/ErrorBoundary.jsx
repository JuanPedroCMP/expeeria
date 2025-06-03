import React, { Component } from 'react';
import styles from './ErrorBoundary.module.css';

/**
 * Componente ErrorBoundary
 * Captura erros em componentes filhos e exibe uma interface alternativa
 * sem quebrar toda a aplicação.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,   // Define se houve erro
      error: null,       // Objeto de erro
      errorInfo: null    // Stack trace e outras informações
    };
  }

  // Atualiza o estado para exibir UI alternativa
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  // Loga o erro e salva informações adicionais no estado
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Aqui você pode enviar os erros para um serviço como Sentry ou LogRocket
  }

  // Permite tentar novamente após um erro
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  render() {
    // Renderiza UI de erro se houver falha
    if (this.state.hasError) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorCard}>
            <h2 className={styles.errorTitle}>Algo deu errado</h2>
            <p className={styles.errorMessage}>
              Desculpe, ocorreu um erro inesperado na aplicação.
            </p>

            {/* Exibe detalhes técnicos do erro se ativado via prop */}
            {this.props.showDetails && this.state.error && (
              <div className={styles.errorDetails}>
                <h3>Detalhes do Erro:</h3>
                <p>{this.state.error.toString()}</p>
                <pre>
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}

            {/* Ações de recuperação */}
            <div className={styles.errorActions}>
              <button
                className={styles.resetButton}
                onClick={this.handleReset}
              >
                Tentar Novamente
              </button>

              <button
                className={styles.homeButton}
                onClick={() => window.location.href = '/'}
              >
                Voltar para a Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Se não houver erro, renderiza normalmente
    return this.props.children;
  }
}

export { ErrorBoundary };
