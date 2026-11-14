import axios from "axios";
import { toast } from "react-toastify";

/* -------------------------------------------------------------------------- */
/*  Error-parsing helpers                                                     */
/* -------------------------------------------------------------------------- */

// Field keys that shouldn't be prefixed with a label when shown to the user.
const NON_FIELD_KEYS = new Set(["non_field_errors", "__all__", "detail"]);

const dedupe = (arr) => [...new Set(arr.filter(Boolean))];

// "phone_number" -> "Phone number"
function humanizeField(field) {
  const spaced = String(field).replace(/_/g, " ").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

// Some backends send `detail` as a *stringified* Python dict, e.g.
//   "{'phone_number': ['Enter a valid phone number.']}"
// That isn't valid JSON (single quotes, True/False/None), so this converts it
// to JSON while respecting quote context — apostrophes inside a message
// (e.g. "can't be blank") won't break parsing. Returns null if it can't parse.
function parsePythonicValue(str) {
  if (typeof str !== "string") return null;
  const input = str.trim();
  if (!input) return null;

  // Already valid JSON?
  try {
    return JSON.parse(input);
  } catch (_) {
    /* fall through to conversion */
  }

  try {
    let out = "";
    let i = 0;

    while (i < input.length) {
      const ch = input[i];

      // Quoted string (single or double quotes)
      if (ch === '"' || ch === "'") {
        const quote = ch;
        let value = "";
        i++; // consume opening quote

        while (i < input.length) {
          const c = input[i];

          if (c === "\\") {
            const next = input[i + 1];
            // Drop the backslash before an escaped quote, keep other escapes.
            value += next === quote ? next : c + (next ?? "");
            i += 2;
            continue;
          }
          if (c === quote) {
            i++; // consume closing quote
            break;
          }
          value += c;
          i++;
        }

        out += JSON.stringify(value); // re-emit as a valid JSON string
        continue;
      }

      // Bare words: only Python's literals are meaningful here.
      if (/[A-Za-z_]/.test(ch)) {
        let word = "";
        while (i < input.length && /[A-Za-z0-9_]/.test(input[i])) {
          word += input[i];
          i++;
        }
        if (word === "True") out += "true";
        else if (word === "False") out += "false";
        else if (word === "None") out += "null";
        else out += JSON.stringify(word); // defensive: treat as string
        continue;
      }

      out += ch;
      i++;
    }

    return JSON.parse(out);
  } catch (_) {
    return null;
  }
}

// Recursively flatten arrays/objects/strings of errors into readable lines.
function flattenErrors(value, key = null) {
  if (value === null || value === undefined) return [];

  if (typeof value === "string") {
    const text = value.trim();
    if (!text) return [];
    return [
      key && !NON_FIELD_KEYS.has(key) ? `${humanizeField(key)}: ${text}` : text,
    ];
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return flattenErrors(String(value), key);
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => flattenErrors(item, key));
  }

  if (typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => flattenErrors(v, k));
  }

  return [];
}

/* -------------------------------------------------------------------------- */

/**
 * Browser-side client for one CMS endpoint. Use it from components (inside
 * effects and event handlers), never from getStaticProps — server code uses
 * `fetchApi()` in functionUtils, which cannot fail a build.
 */
export default class APIBase {
  constructor(config) {
    if (!config.baseURL) throw new Error("Base URL cannot be empty");

    this.config = {
      baseURL: config.baseURL,
      defaultHeaders: config.defaultHeaders || {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      timeout: config.timeout || 30000,
      // How many toasts to show at once before summarizing the rest.
      maxToasts: config.maxToasts || 4,
      // Set true to also toast on failed GET/read requests (default: false).
      notifyOnRead: config.notifyOnRead || false,
    };

    this.apiClient = axios.create({
      baseURL: this.config.baseURL,
      headers: this.config.defaultHeaders,
      timeout: this.config.timeout,
    });

    // so the verbs can be passed around detached from the instance
    this.get = this.get.bind(this);
    this.post = this.post.bind(this);
    this.put = this.put.bind(this);
    this.patch = this.patch.bind(this);
    this.delete = this.delete.bind(this);

    this.apiClient.interceptors.request.use((requestConfig) => {
      let language = "en";
      try {
        language = window.localStorage.getItem("language") || "en";
      } catch {
        // no window during SSR, or storage blocked in a privacy mode
      }

      requestConfig.headers["X-Language"] = language;
      return requestConfig;
    });
  }

  /**
   * Normalize any backend error payload into an array of human-readable
   * messages. Handles:
   *  - plain strings
   *  - the nested `{ response: { message, invalid } }` shape
   *  - `detail` as a stringified Python dict of field errors
   *  - `detail` as a real object/array of field errors
   *  - a bare field-error dict, e.g. `{ phone_number: [...] }`
   *  - generic `{ error | detail | message | details }` fallbacks
   */
  extractErrorMessages = (data) => {
    const fallback = "An unexpected error occurred";

    if (data === null || data === undefined) return [fallback];
    if (typeof data === "string") return [data.trim() || fallback];

    // Existing nested-response special case
    if (data.response && typeof data.response === "object") {
      const { invalid, message } = data.response;
      let line = message || "An error occurred";
      if (Array.isArray(invalid) && invalid.length) {
        const details = invalid
          .map((item) => `ID: ${item.id}, Year: ${item.year}`)
          .join("; ");
        line += ` (Invalid: ${details})`;
      }
      return [line];
    }

    // `detail` sent as a STRING — possibly a stringified dict of field errors.
    if (typeof data.detail === "string") {
      const parsed = parsePythonicValue(data.detail);

      if (parsed && typeof parsed === "object") {
        const messages = flattenErrors(parsed);
        if (messages.length) return dedupe(messages);
      }
      if (typeof parsed === "string" && parsed.trim()) {
        return [parsed.trim()];
      }
      // Not a dict, just a plain human-readable string ("Not found.", etc.)
      return [data.detail.trim() || fallback];
    }

    // `detail` already an object/array of field errors.
    if (data.detail && typeof data.detail === "object") {
      const messages = flattenErrors(data.detail);
      if (messages.length) return dedupe(messages);
    }

    // The payload itself may be a field-error dict, e.g. { phone_number: [...] }.
    const ignore = ["error", "message", "code", "status", "details"];
    const fieldErrors = flattenErrors(
      Object.fromEntries(
        Object.entries(data).filter(([k]) => !ignore.includes(k))
      )
    );
    if (fieldErrors.length) return dedupe(fieldErrors);

    // Generic fallbacks
    const generic =
      data.error || data.detail || data.details || data.message || fallback;
    return [typeof generic === "string" ? generic : fallback];
  };

  // Show one toast per message, capping to avoid flooding the screen.
  notifyErrors = (messages) => {
    const list = dedupe(Array.isArray(messages) ? messages : [messages]);
    if (!list.length) {
      toast.error("Something went wrong");
      return;
    }

    const max = this.config.maxToasts;
    list.slice(0, max).forEach((msg) => toast.error(msg));
    if (list.length > max) {
      toast.error(`…and ${list.length - max} more error(s)`);
    }
  };

  // Side effects only (logging + toasts). Control flow lives in makeRequest.
  handleErrorResponse = (error) => {
    const method = error?.config?.method?.toLowerCase();
    const isMutating = ["post", "put", "patch", "delete"].includes(method);
    // Writes are the visitor's own action, so they always hear about a
    // failure. Reads are background content loads and stay quiet unless the
    // instance opts in — except auth errors, which are never routine.
    const notify = isMutating || this.config.notifyOnRead;

    const { response } = error;

    if (response) {
      const { status, data, config } = response;
      const messages = this.extractErrorMessages(data);

      console.error("API error:", status, config?.url, messages);

      if (notify || status === 401 || status === 403) {
        this.notifyErrors(messages);
      }
    } else if (error.request) {
      console.error("Network error:", error.message);
      if (notify) {
        toast.error("No response from the server. Please check your connection.");
      }
    } else {
      console.error("Unexpected error:", error.message);
      if (notify) toast.error(error.message || "Something went wrong");
    }
  };

  async makeRequest(method, endpoint = "", data = null, headers = {}) {
    try {
      const response = await this.apiClient({
        method,
        url: endpoint || this.config.baseURL,
        data,
        headers: { ...this.config.defaultHeaders, ...headers },
      });
      return response.data;
    } catch (error) {
      this.handleErrorResponse(error); // toast + log

      // A 404 on a read is returned rather than thrown, so callers can treat
      // "not found" as data without a try/catch. Writes always throw.
      if (error?.response?.status === 404 && method === "get") {
        return error;
      }
      throw error;
    }
  }

  // `endpoint` is a query string or sub-path appended to baseURL ("?page=2")
  get(endpoint = "", headers = {}) {
    return this.makeRequest("get", endpoint, null, headers);
  }

  post(endpoint = "", data, headers = {}) {
    return this.makeRequest("post", endpoint, data, headers);
  }

  put(endpoint = "", data, headers = {}) {
    return this.makeRequest("put", endpoint, data, headers);
  }

  patch(endpoint = "", data, headers = {}) {
    return this.makeRequest("patch", endpoint, data, headers);
  }

  delete(endpoint = "", headers = {}) {
    return this.makeRequest("delete", endpoint, null, headers);
  }
}
