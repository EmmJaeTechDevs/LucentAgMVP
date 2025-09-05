// Simple POST request using XMLHttpRequest to avoid CORS preflight
export async function makeSimpleCorsRequest(url: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Use POST method
    xhr.open('POST', url, true);
    
    // Set minimal headers to avoid preflight
    xhr.setRequestHeader('Content-Type', 'text/plain');
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            // Try to parse JSON response
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            // If not JSON, return raw response
            resolve({ success: true, response: xhr.responseText });
          }
        } else {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      }
    };
    
    xhr.onerror = function() {
      reject(new Error('Network error'));
    };
    
    xhr.ontimeout = function() {
      reject(new Error('Request timeout'));
    };
    
    // Set timeout
    xhr.timeout = 15000;
    
    // Send data as JSON string
    xhr.send(JSON.stringify(data));
  });
}

// JSONP-style request for GET-like operations
export function makeJSONPRequest(url: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    
    // Create callback function
    (window as any)[callbackName] = (response: any) => {
      delete (window as any)[callbackName];
      document.body.removeChild(script);
      resolve(response);
    };
    
    // Create script tag
    const script = document.createElement('script');
    const params = new URLSearchParams({
      callback: callbackName,
      data: JSON.stringify(data)
    });
    script.src = `${url}?${params.toString()}`;
    
    script.onerror = () => {
      delete (window as any)[callbackName];
      document.body.removeChild(script);
      reject(new Error('JSONP request failed'));
    };
    
    document.body.appendChild(script);
  });
}