// hooks/useLenis.js
import { useEffect, useRef, createContext, useContext } from "react";
import Lenis from "@studio-freight/lenis";

export const LenisContext = createContext(null);

export const useLenisContext = () => useContext(LenisContext);

const useLenis = () => {
    const lenisRef = useRef(null);

    useEffect(() => {
        const lenis = new Lenis({
            duration: 0,
            smooth: true,
            smoothTouch: false,
        });

        lenisRef.current = lenis; // store instance

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
            lenisRef.current = null;
        };
    }, []);

    return lenisRef;
};

export default useLenis;
