import { sweetalert_default_error } from "./commonUtils";


export class HttpResponseHandler {
    constructor() {
        this.defaultHandlers = {
            400: () => console.log('400 Bad Request'),
            401: () => console.log('401 Unauthorized'),
            402: () => console.log('402 Payment Required'),
            403: () => console.log('403 Forbidden'),
            404: () => console.log('404 Not Found'),
            405: () => console.log('405 Method Not Allowed'),
            406: () => console.log('406 Not Acceptable'),
            407: () => console.log('407 Proxy Authentication Required'),
            408: () => console.log('408 Request Timeout'),
            409: () => console.log('409 Conflict'),
            410: () => console.log('410 Gone'),
            411: () => console.log('411 Length Required'),
            412: () => console.log('412 Precondition Failed'),
            413: () => console.log('413 Payload Too Large'),
            414: () => console.log('414 URI Too Long'),
            415: () => console.log('415 Unsupported Media Type'),
            416: () => console.log('416 Range Not Satisfiable'),
            417: () => console.log('417 Expectation Failed'),
            418: () => console.log('418 I’m a teapot (RFC 2324)'),
            421: () => console.log('421 Misdirected Request'),
            422: () => console.log('422 Unprocessable Entity (WebDAV)'),
            423: () => console.log('423 Locked (WebDAV)'),
            424: () => console.log('424 Failed Dependency (WebDAV)'),
            425: () => console.log('425 Too Early'),
            426: () => console.log('426 Upgrade Required'),
            428: () => console.log('428 Precondition Required'),
            429: () => console.log('429 Too Many Requests'),
            431: () => console.log('431 Request Header Fields Too Large'),
            451: () => console.log('451 Unavailable For Legal Reasons'),
            500: () => console.log('500 Internal Server Error'),
            501: () => console.log('501 Not Implemented'),
            502: () => console.log('502 Bad Gateway'),
            503: () => console.log('503 Service Unavailable'),
            504: () => console.log('504 Gateway Timeout'),
            505: () => console.log('505 HTTP Version Not Supported'),
            506: () => console.log('506 Variant Also Negotiates'),
            507: () => console.log('507 Insufficient Storage (WebDAV)'),
            508: () => console.log('508 Loop Detected (WebDAV)'),
            510: () => console.log('510 Not Extended'),
            511: () => console.log('511 Network Authentication Required'),
            default: () => sweetalert_default_error(),
        };
    }

    handle(statusCode, customHandlers = {}) {
        const handler = customHandlers[statusCode] || this.defaultHandlers[statusCode] || this.defaultHandlers.default;
        handler();
    }
}
