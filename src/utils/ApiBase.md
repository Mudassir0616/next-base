# APIBase

`APIBase` ([apiBase.js](apiBase.js)) is the **browser-side** client for the CMS. Every endpoint is declared once in [src/api/api.js](../api/api.js) as a named instance:

```js
export const FaqApi = new APIBase({
    baseURL: `${BASE_URL}/api/faq/`,
});
```

Use instances from components — inside `useEffect` or event handlers. Server code (`getStaticProps`, `getStaticPaths`, `getServerSideProps`) uses `fetchApi()` from `functionUtils.js` instead, which returns `null` rather than throwing, so a CMS outage cannot fail a build.

## Config

| Option | Default | |
| --- | --- | --- |
| `baseURL` | — (required) | The endpoint this instance talks to. |
| `defaultHeaders` | JSON content type + `ngrok-skip-browser-warning` | Replaced wholesale when given. Pass headers without `Content-Type` for multipart uploads so axios sets the boundary (see `CareerApplicationApi`). |
| `timeout` | `30000` | ms. |
| `notifyOnRead` | `false` | Also toast failed reads. |
| `maxToasts` | `4` | Error toasts shown at once before "…and N more". |

Every request also sends `X-Language` from `localStorage.language` (default `en`).

## Calls

```js
const page = await BlogListApi.get("?page=2&order_by=-created_at");
await ContactApi.post("", payload);           // "" = the baseURL itself
await SomeApi.put("<id>/", payload);          // sub-path appended to baseURL
```

`get(endpoint, headers)`, `post(endpoint, data, headers)`, `put(…)`, `patch(…)`, `delete(endpoint, headers)`. `endpoint` is a query string or sub-path appended to `baseURL`. Each resolves to the response body.

## Errors

- **Writes** (`post`/`put`/`patch`/`delete`) toast every message the backend sent, then **throw**. Catch in the caller — or let `GlobalForm` do it, which awaits and catches `on_Submit`. Don't toast again.
- **Reads** stay silent (logged only) unless `notifyOnRead` is set, except 401/403, which always toast. A read that fails still throws, except:
- **A 404 on a read is returned, not thrown**, so "not found" can be handled as data.

`extractErrorMessages` turns any backend error shape into readable lines — DRF field dicts, `non_field_errors`, and `detail` sent as a stringified Python dict (`"{'phone_number': ['Enter a valid phone number.']}"`).
