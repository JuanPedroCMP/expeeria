import React from 'react';
import { createContext, useEffect, useState } from "react";
import { AuthProvider } from './AuthContext';
import { PostProvider } from './PostContext';
import { CommentProvider } from './CommentContext';
import { NotificationProvider } from './NotificationContext';

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext({});

export const AppContextProvider = (props) => {
  const { children } = props;

  return <AppContext.Provider value={{}}>{children}</AppContext.Provider>;
};

/**
 * Provedor de contexto global para o aplicativo
 * Agrupa todos os contextos em um único componente
 */
export function AppProvider({ children }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <PostProvider>
          <CommentProvider>
            {children}
          </CommentProvider>
        </PostProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default AppProvider;
