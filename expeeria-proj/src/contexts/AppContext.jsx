// eslint-disable-next-line no-unused-vars
import { createContext, useEffect, useState } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext({});

export const AppContextProvider = (props) => {
  const { children } = props;

  return <AppContext.Provider value={{}}>{children}</AppContext.Provider>;
};
