"use client"
import { SiteSettingApi } from '@/api/api';
import React, { createContext, useState, useContext, useEffect } from 'react';

// Create Context
export const SiteSetting = createContext();

// Provider Component
export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState([]);


    const fetch_settings = async () => {
        try {
            const res = await SiteSettingApi.get(``);
            if (res?.results?.length > 0) {
                setSettings(res?.results?.[0]);
            }
        } catch (err) {
            console.error(err);
        }
    };


    useEffect(() => {
        fetch_settings();
    }, []);

    return (
        <SiteSetting.Provider value={{ settings, setSettings }}>
            {children}
        </SiteSetting.Provider>
    );
};

// Custom hook for accessing company details context
export const useSiteSetting = () => useContext(SiteSetting);
