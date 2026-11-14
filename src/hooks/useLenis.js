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
        });

        lenisRef.current = lenis; // store instance

        let frame;
        function raf(time) {
            lenis.raf(time);
            frame = requestAnimationFrame(raf);
        }

        frame = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(frame);
            lenis.destroy();
            lenisRef.current = null;
        };
    }, []);

    return lenisRef;
};

export default useLenis;
