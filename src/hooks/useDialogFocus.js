import { useEffect } from "react";

const FOCUSABLE = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled]):not([type=hidden])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
].join(",");

/**
 * Focus handling for a hand-built modal dialog (MUI's <Modal> does this
 * itself). While `open`:
 *
 *  - focus moves to the first focusable element in `ref` (or `ref` itself,
 *    which should carry tabIndex={-1}),
 *  - Tab / Shift+Tab cycle inside it instead of escaping to the page behind,
 *
 * and when it closes, focus returns to whatever had it before — usually the
 * button that opened the dialog. Escape-to-close stays with the component.
 */
export default function useDialogFocus(ref, open) {
    useEffect(() => {
        if (!open) return;

        const dialog = ref.current;
        if (!dialog) return;

        const opener = document.activeElement;
        const focusables = () =>
            [...dialog.querySelectorAll(FOCUSABLE)].filter(
                (element) => !element.closest("[inert]"),
            );

        (focusables()[0] || dialog).focus({ preventScroll: true });

        const onKeyDown = (event) => {
            if (event.key !== "Tab") return;

            const items = focusables();
            if (!items.length) {
                event.preventDefault();
                dialog.focus({ preventScroll: true });
                return;
            }

            const first = items[0];
            const last = items[items.length - 1];
            const outside = !dialog.contains(document.activeElement);

            if (event.shiftKey && (document.activeElement === first || outside)) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && (document.activeElement === last || outside)) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            opener?.focus?.({ preventScroll: true });
        };
    }, [ref, open]);
}
