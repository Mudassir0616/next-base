// next lint was removed in Next.js 16 — ESLint runs directly (`npm run lint`),
// and `next build` no longer lints, so this has to be run on its own in CI.
// eslint-config-next ships flat config natively now, so no FlatCompat shim.
//
// Pin eslint to ^9: eslint-config-next 16 pulls typescript-eslint 8, whose
// scope manager is not compatible with eslint 10 (`scopeManager.addGlobals is
// not a function`).
import next from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...next,
  {
    ignores: [".next/**", "out/**", "build/**", "node_modules/**"],
  },
  {
    rules: {
      // eslint-plugin-react-hooks 7 (new in eslint-config-next 16) errors on
      // two patterns this base is built on. They are downgraded to warnings so
      // a clone's `npm run lint` is not red out of the box — treat them as a
      // real backlog item, not as noise.
      //
      // set-state-in-effect: every feature component fetches its CMS content
      // with `useEffect(() => { fetch_x() }, [])` and setStates the result.
      // Moving that to getStaticProps or a fetch library is a refactor of its
      // own, not part of the framework upgrade.
      "react-hooks/set-state-in-effect": "warn",
      // refs: Navbar resets `menuItemsRef.current` during render so the ref
      // callbacks can re-collect the items GSAP staggers over.
      "react-hooks/refs": "warn",
    },
  },
];

export default eslintConfig;
