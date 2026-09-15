"use client"
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

// The enquiry popup lives once in _app, next to the page. This lets anything in
// the tree raise it — the timer inside PopupForm is only one of its triggers.
export const PopupFormContext = createContext(null);

export const PopupFormProvider = ({ children }) => {
    const [open, setOpen] = useState(false);

    const openPopup = useCallback(() => setOpen(true), []);
    const closePopup = useCallback(() => setOpen(false), []);

    const value = useMemo(
        () => ({ open, openPopup, closePopup }),
        [open, openPopup, closePopup],
    );

    return (
        <PopupFormContext.Provider value={value}>
            {children}
        </PopupFormContext.Provider>
    );
};

// falls back to an empty object so a consumer outside the provider cannot crash
export const usePopupForm = () => useContext(PopupFormContext) || {};
