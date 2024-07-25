// context/useWallet.js
import { createContext, useContext, useState } from "react";

const GlobalContext = createContext();

export const GlobalContextProvider = ({ children }) => {
  const adminAddress = "0x1c620232Fe5Ab700Cc65bBb4Ebdf15aFFe96e1B5";
  const [userAddress, setUserAddress] = useState("");

  return (
    <GlobalContext.Provider
      value={{
        userAddress,
        setUserAddress,
        adminAddress,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error(
      "useGlobalContext must be used within a GlobalContextProvider"
    );
  }
  return context;
};
