// pages/_app.js
import "../styles/globals.css";
import { GlobalContextProvider } from "../context/Store";

function MyApp({ Component, pageProps }) {
  return (
    <GlobalContextProvider>
      <Component {...pageProps} />
    </GlobalContextProvider>
  );
}

export default MyApp;
