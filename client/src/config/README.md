# API Configuration

This directory contains the API configuration for connecting to your backend server.

## Quick Setup

1. **Update the Backend URL**: 
   - Edit `client/.env.local` and change `VITE_API_BASE_URL` to your backend URL
   - Example: `VITE_API_BASE_URL=https://your-backend.com`

2. **Use in your components**:
   ```typescript
   import { api } from '@/utils/api';

   // For farmers
   const response = await api.farmers.register(formData);
   
   // For buyers  
   const response = await api.buyers.register(formData);
   
   // For products
   const products = await api.products.getAll();
   ```

## Configuration Files

- `api.ts` - Main API configuration and endpoints
- `../utils/api.ts` - API client with helper functions
- `../.env.local` - Environment variables (update your backend URL here)

## Available API Methods

### Authentication
- `api.auth.login(credentials)`
- `api.auth.register(userData)`
- `api.auth.verify(token)`
- `api.auth.refreshToken()`
- `api.auth.logout()`

### Farmers
- `api.farmers.register(farmerData)`
- `api.farmers.getProfile()`
- `api.farmers.updateProfile(data)`
- `api.farmers.getCrops()`
- `api.farmers.getOrders()`

### Buyers
- `api.buyers.register(buyerData)`
- `api.buyers.getProfile()`
- `api.buyers.updateProfile(data)`
- `api.buyers.getCart()`
- `api.buyers.getOrders()`

### Products
- `api.products.getAll(filters?)`
- `api.products.getById(id)`
- `api.products.search(query)`
- `api.products.getCategories()`

### Orders
- `api.orders.create(orderData)`
- `api.orders.getAll()`
- `api.orders.getById(id)`
- `api.orders.update(id, data)`
- `api.orders.cancel(id)`

## Environment Variables

Update these in `client/.env.local`:

- `VITE_API_BASE_URL` - Your backend URL (e.g., http://localhost:8000)
- `VITE_API_TIMEOUT` - Request timeout in milliseconds (default: 10000)
- `VITE_ENABLE_API_LOGGING` - Enable console logging (true/false)

## Error Handling

The API client automatically handles:
- Network errors
- Request timeouts  
- HTTP status errors
- Token authentication

Errors are thrown as `ApiException` with details about the error.