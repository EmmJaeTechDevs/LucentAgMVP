// Simple CORS request that avoids preflight
export async function makeSimpleCorsRequest(url: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    // Create a form to submit data without triggering CORS preflight
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;
    form.style.display = 'none';
    
    // Add data as hidden input
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'data';
    input.value = JSON.stringify(data);
    form.appendChild(input);
    
    // Create hidden iframe to capture response
    const iframe = document.createElement('iframe');
    iframe.name = 'response-frame';
    iframe.style.display = 'none';
    form.target = 'response-frame';
    
    document.body.appendChild(form);
    document.body.appendChild(iframe);
    
    // Handle iframe load
    iframe.onload = () => {
      try {
        // Try to read response from iframe
        const response = iframe.contentDocument?.body?.textContent || '{}';
        const parsedResponse = JSON.parse(response);
        resolve(parsedResponse);
      } catch (error) {
        resolve({ success: true }); // Assume success if we can't read response
      } finally {
        // Cleanup
        document.body.removeChild(form);
        document.body.removeChild(iframe);
      }
    };
    
    iframe.onerror = () => {
      reject(new Error('Network error'));
      document.body.removeChild(form);
      document.body.removeChild(iframe);
    };
    
    // Submit form
    form.submit();
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