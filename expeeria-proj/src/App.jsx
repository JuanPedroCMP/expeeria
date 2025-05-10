import { BrowserRouter } from "react-router-dom";
import { Router } from "./Router";

// Estilos principais
import "./App.css";
import "./styles/enhanced.css";
import "./styles/professional.css";
import "./styles/components.css";
import "./styles/layout.css";
import "./styles/auth.css";
import "./styles/accessibility.css"; // Estilos de acessibilidade
import "./styles/themes.css"; // Definições de temas
import "./styles/accessibilityFeatures.css"; // Posicionamento de recursos de acessibilidade

// Contextos e componentes
import { AppProvider } from "./contexts/AppContext";
import { Notifications } from "./components";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import { AccessibilityMenu } from "./components/Accessibility/AccessibilityMenu";
import { BackToTop } from "./components/BackToTop/BackToTop";
import { ScreenReader } from "./components/ScreenReader/ScreenReader";
import { ThemeSelector } from "./components/ThemeSelector/ThemeSelector";

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <Router />
          <Notifications />
          <div className="accessibilityFeatures">
            <ThemeSelector />
          </div>
          <AccessibilityMenu />
          <BackToTop />
          <ScreenReader />
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}