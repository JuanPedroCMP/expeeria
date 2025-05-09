import { BrowserRouter } from "react-router-dom";
import { Router } from "./Router";

// Estilos principais
import "./App.css";
import "./styles/enhanced.css";
import "./styles/professional.css";
import "./styles/components.css";
import "./styles/layout.css";
import "./styles/auth.css";

// Contextos e componentes
import { AppProvider } from "./contexts/AppContext";
import { Notifications } from "./components";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Router />
        <Notifications />
      </BrowserRouter>
    </AppProvider>
  );
}