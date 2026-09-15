import Head from "next/head";
import Navbar from "@/components/common/Navbar/Navbar";
import Footer from "@/components/common/Footer/Footer";
import "../styles/global.css";
import "../styles/main.css";
import { ToastContainer } from "react-toastify";
import { SettingsProvider } from "@/context/useSiteSettings";
import { useRouter } from "next/router";
import { normalizePath } from "@/utils/functionUtils";
import { renderHeadTags } from "@/utils/renderHeadTags";
import useLenis, { LenisContext } from "@/hooks/useLenis";
import PopupForm from "@/components/common/PopupForm/Index";
import { PopupFormProvider } from "@/context/usePopupForm";
import { ThemeProvider } from "@mui/material";
import baseTheme from "@/theme";

export default function App({ Component, pageProps }) {
  const lenisRef = useLenis();
  const router = useRouter();

  const currentPath = normalizePath(router.asPath);

  const matchedHead = pageProps?.heads?.find(
    (h) => normalizePath(h.target_url) === currentPath,
  );

  const finalHead = matchedHead?.head || pageProps?.globalHead || null;

  return (
    <>
      <Head>

        {/* Favicons */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicon/site.webmanifest"></link>

        {finalHead && renderHeadTags(finalHead)}
      </Head>

      <ToastContainer autoClose={3000} limit={1} />

      <ThemeProvider theme={baseTheme}>

        <SettingsProvider>
          <PopupFormProvider>
            <LenisContext.Provider value={lenisRef}>
              <Navbar />
              <main>
                <Component {...pageProps} />
                <PopupForm />
              </main>
              <Footer />
            </LenisContext.Provider>
          </PopupFormProvider>
        </SettingsProvider>
      </ThemeProvider>
    </>
  );
}
