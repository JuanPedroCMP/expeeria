import React, { Component } from 'react';
import styles from './ErrorBoundary.module.css';

/**
 * Componente ErrorBoundary para capturar erros em componentes filhos
 * e exibir uma UI de fallback em vez de quebrar a aplicau00e7u00e3o inteira
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Atualiza o estado para que a pru00f3xima renderizau00e7u00e3o mostre a UI de fallback
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Registra o erro para finu de depurau00e7u00e3o
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Aqui poderia integrar com serviu00e7os de monitoramento de erros como Sentry
  }

  handleReset = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  render() {
    if (this.state.hasError) {
      // Renderizar qualquer UI de fallback
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorCard}>
            <h2 className={styles.errorTitle}>Algo deu errado</h2>
            <p className={styles.errorMessage}>Desculpe, ocorreu um erro inesperado na aplicau00e7u00e3o.</p>
            
            {this.props.showDetails && this.state.error && (
              <div className={styles.errorDetails}>
                <h3>Detalhes do Erro:</h3>
                <p>{this.state.error.toString()}</p>
                <pre>
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
            
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

    // Se nu00e3o houver erro, renderizar os componentes filhos normalmente
    return this.props.children;
  }
}

export { ErrorBoundary };
