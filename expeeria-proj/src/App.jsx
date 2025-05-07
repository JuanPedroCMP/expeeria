import { BrowserRouter } from "react-router-dom";
import { Router } from "./Router";
import "./App.css";
import { AppContextProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { Notifications } from "./components";

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContextProvider>
          <BrowserRouter>
            <Router />
            <Notifications />
          </BrowserRouter>
        </AppContextProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}