import { BrowserRouter } from "react-router-dom";
import { Router } from "./Router";
import "./App.css";
import { AppContextProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";


export default function App() {
  return (
    <AuthProvider>
      <AppContextProvider>
        <BrowserRouter>
          <Router />
        </BrowserRouter>
      </AppContextProvider>
    </AuthProvider>
  );
}