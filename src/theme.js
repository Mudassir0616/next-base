import { createTheme } from "@mui/material";

// MUI ships its own Roboto-based theme, which ignores the site's stylesheets —
// every MUI surface (inputs, menus, pagination, dialogs) needs this to match.
export const FONT_FAMILY = '"Poppins", sans-serif';

export const baseTheme = createTheme({
    typography: {
        fontFamily: FONT_FAMILY,
    },
    // The site's own chrome is stacked far above MUI's defaults — the navbar is
    // fixed at 9999 and .member-modal at 10001 — so the stock modal layer (1300)
    // is painted underneath it. Lifting the whole overlay scale here rather than
    // per-component matters: a Select inside a Modal opens its menu on the modal
    // layer too, so a dialog that raises only itself gets a menu rendered behind
    // it. That menu is invisible, never closes (its backdrop is behind the
    // dialog, so no click reaches it) and its focus trap keeps yanking focus
    // back, which leaves the whole dialog unclickable and unselectable.
    zIndex: {
        drawer: 10000,
        modal: 10001,
        snackbar: 10100,
        tooltip: 10200,
    },
});

export default baseTheme;
