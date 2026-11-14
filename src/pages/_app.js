import Head from "next/head";
import Navbar from "@/components/common/Navbar/Navbar";
import Footer from "@/components/common/Footer/Footer";
import "../styles/global.css";
import "../styles/main.css";
import { ToastContainer } from "react-toastify";
import { SettingsProvider } from "@/context/useSiteSettings";
import { SeoHeadContext } from "@/context/useSeoHead";
import { metaKey } from "@/utils/renderHeadTags";
import useLenis, { LenisContext } from "@/hooks/useLenis";
import PopupForm from "@/components/common/PopupForm/Index";
import { PopupFormProvider } from "@/context/usePopupForm";
import { ThemeProvider } from "@mui/material";
import baseTheme from "@/theme";
import site from "@/site.config";

const NO_SEO_HEAD = { route: null, global: null };

export default function App({ Component, pageProps }) {
  const lenisRef = useLenis();

  return (
    <SeoHeadContext.Provider value={pageProps?.seoHead || NO_SEO_HEAD}>
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

        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Only for a page that renders no <Seo>; every <Seo> overrides both,
            because it shares their keys and renders later. */}
        <title key="title">{site.name}</title>
        <meta
          key={metaKey("description")}
          name="description"
          content={site.description}
        />
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
    </SeoHeadContext.Provider>
  );
}
