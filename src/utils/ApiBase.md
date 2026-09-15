
# APIBase JavaScript Class Documentation

## Overview
The `APIBase` class is a comprehensive JavaScript utility designed to simplify the process of making HTTP requests using Axios. It provides a structured way to handle API requests and responses, including error handling, token management, and request debouncing.

## Features
- Centralized API request configuration
- Easy management of JWT tokens for authentication
- Built-in error handling mechanisms
- Support for all HTTP request methods (GET, POST, PUT, PATCH, DELETE)
- Utility methods for common tasks
- Interceptors for request and response processing
- Debouncing of requests

## Installation
Before using `APIBase`, ensure Axios is installed in your project:
```bash
npm install axios
```

## Initialization
To use the `APIBase` class, create an instance with the required configuration:
```javascript
import APIBase from './APIBase'; // Adjust the path based on your project structure

const apiClient = new APIBase({
    baseURL: 'https://your-api-url.com',
    defaultHeaders: {'Content-Type': 'application/json'},
    // Other configurations...
});
```

## Constructor
The constructor of `APIBase` initializes the class with custom configurations:
- `baseURL`: The base URL for all API requests.
- `defaultHeaders`: Default headers to be included in every request.
- Additional optional configurations:
  - `timeout`: Request timeout in milliseconds.
  - `tokenKey`: Key for storing JWT token in local storage.
  - `retryLimit`: Number of retries for failed requests.
  - `debounceDelay`: Delay for debouncing requests.

## Axios Instance
An Axios instance is created with the provided configurations. This instance is used for all API requests made by the class.

## Token Management
The class includes methods to manage JWT tokens:
- `getToken()`: Retrieve the token from local storage.
- `setToken(token)`: Store a new token in local storage.
- `removeToken()`: Remove the token from local storage.
- `addToken(token)`: Add the token to the Axios instance's headers.

## Making API Requests
The class provides methods for each HTTP request type:
- `get(endpoint, params, headers)`: Make a GET request.
- `post(endpoint, data, headers)`: Make a POST request.
- `put(endpoint, data, headers)`: Make a PUT request.
- `patch(endpoint, data, headers)`: Make a PATCH request.
- `delete(endpoint, headers)`: Make a DELETE request.
Each method uses the `makeRequest` function to process the request.

## Error Handling
`handleErrorResponse(error)`: Handles errors from API requests and logs them.

## Utility Methods
- `formatDate(date)`: Formats a date to a readable string.
- `parseJSON(response)`: Safely parses a JSON response.
- `serializeParams(params)`: Serializes URL parameters.
- `checkStatus(response)`: Checks if the response status is successful.
- `extractErrorMessage(error)`: Extracts the error message from a response.
- `buildAuthHeader(token)`: Builds an authorization header.
- `logRequest(url, method, data)`: Logs the details of a request.
- `debounceRequest(func)`: Debounces a function to prevent rapid firing.

## Interceptors
Placeholder methods for request and response interceptors are provided, allowing for custom logic to be implemented as needed.

## Advanced Features
- `validateResponseSchema(response, schema)`: Method stub for implementing response schema validation.
- `tokenRefreshInterceptor(apiClient, refreshToken)`: Interceptor for token refresh logic.

## Best Practices
- Always handle errors gracefully.
- Use debouncing for frequent requests.
- Securely manage tokens.

## Troubleshooting
- Ensure that `baseURL` is correctly set.
- Check headers and tokens for authentication issues.
- Use console logs to debug request and response data.

## Conclusion
`APIBase` is a versatile tool for managing API requests in JavaScript applications. Its structured approach and utility functions make API interactions more efficient and error-resistant.


# APIBase Class Usage Examples

This README provides examples of how to use the `APIBase` class for making API requests.

## Setting Up an Instance

First, create an instance of `APIBase` by specifying the base URL and default headers. This instance will be used for all subsequent API calls.

```javascript
const apiClient = new APIBase({
    baseURL: 'https://example.com/api/resource', // Base URL set here
    defaultHeaders: { 'Content-Type': 'application/json' }
});
```

## Examples

### 1. GET Request

Fetch data from the base URL or a specific endpoint.

```javascript
// Fetch from the base URL
apiClient.get()
    .then(response => console.log(response))
    .catch(error => console.error(error));

// Fetch from a specific endpoint (overriding the base URL)
apiClient.get('/specific-endpoint')
    .then(response => console.log(response))
    .catch(error => console.error(error));
```

### 2. POST Request

Create a new resource at the base URL or a specific endpoint.

```javascript
const newData = { name: 'New Resource' };

// Create at the base URL
apiClient.post('', newData)
    .then(response => console.log(response))
    .catch(error => console.error(error));

// Create at a specific endpoint
apiClient.post('/specific-endpoint', newData)
    .then(response => console.log(response))
    .catch(error => console.error(error));
```

### 3. PUT Request

Update a resource at the base URL or a specific endpoint.

```javascript
const updatedData = { name: 'Updated Resource' };

// Update at the base URL
apiClient.put('', updatedData)
    .then(response => console.log(response))
    .catch(error => console.error(error));

// Update at a specific endpoint
apiClient.put('/specific-endpoint', updatedData)
    .then(response => console.log(response))
    .catch(error => console.error(error));
```

### 4. PATCH Request

Partially update a resource at the base URL or a specific endpoint.

```javascript
const partialData = { name: 'Partially Updated Resource' };

// Partially update at the base URL
apiClient.patch('', partialData)
    .then(response => console.log(response))
    .catch(error => console.error(error));

// Partially update at a specific endpoint
apiClient.patch('/specific-endpoint', partialData)
    .then(response => console.log(response))
    .catch(error => console.error(error));
```

### 5. DELETE Request

Delete a resource at the base URL or a specific endpoint.

```javascript
// Delete at the base URL
apiClient.delete()
    .then(response => console.log(response))
    .catch(error => console.error(error));

// Delete at a specific endpoint
apiClient.delete('/specific-endpoint')
    .then(response => console.log(response))
    .catch(error => console.error(error));
```

## Notes

- When no endpoint is provided in the method call, the request is made to the base URL specified in the constructor.
- To target a specific endpoint different from the base URL, provide the endpoint in the method call.
- The data and headers parameters in `post`, `put`, and `patch` methods work as in standard Axios requests. Headers provided in these method calls will override the default headers set in the constructor.