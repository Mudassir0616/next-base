"use client"
import { SiteSettingApi } from '@/api/api';
import React, { createContext, useState, useContext, useEffect } from 'react';

export const SiteSetting = createContext({ settings: {}, loading: true });

/**
 * The single /api/site-setting/ record, fetched once in the browser and shared
 * by every page. `settings` is `{}` until it lands; `loading` is true until
 * the request settles (successfully or not), so a section can hold its space
 * instead of flashing empty headings.
 */
export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const fetchSettings = async () => {
            try {
                const res = await SiteSettingApi.get(``);
                if (!cancelled && res?.results?.length > 0) {
                    setSettings(res.results[0]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchSettings();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <SiteSetting.Provider value={{ settings, setSettings, loading }}>
            {children}
        </SiteSetting.Provider>
    );
};

export const useSiteSetting = () => useContext(SiteSetting);
