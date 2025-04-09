# Frontend Deployment Guide

This guide explains how to deploy the E-polyclinic.uz frontend in both development and production environments using Docker.

## Project Structure

```
frontend/
├── Dockerfile.dev        # Development Docker configuration
├── Dockerfile.prod       # Production Docker configuration
├── nginx.conf            # Nginx configuration for production
├── package.json          # Project dependencies
└── src/                  # Source code
```

## Development Environment

The development environment provides hot-reloading capabilities to make the development process more efficient.

### Running Development Environment

```bash
# Start the development environment
docker-compose up frontend

# Or start all services including development frontend
docker-compose up -d
```

In development mode:
- The application runs on a Node.js development server
- Changes to source files trigger automatic reloads
- API requests are proxied to the backend service
- The application is accessible at http://localhost:8080

## Production Environment

The production environment uses Nginx to serve the static files built with the Vue.js build process.

### Running Production Environment

```bash
# Comment out the development frontend service in docker-compose.yml
# Uncomment the production frontend service

# Start the production environment
docker-compose up frontend-prod

# Or start all services including production frontend
docker-compose up -d
```

In production mode:
- The application is built as static files
- Nginx serves the static files
- API requests are proxied to the backend service
- The application is accessible at http://localhost (port 80)

## Environment Configuration

### Environment Variables

You can configure the frontend by updating the environment variables:

- **Development**: Add variables to the `environment` section in the `frontend` service
- **Production**: Environment variables must be set during the build process

### API URL Configuration

- **Development**: Set `VUE_APP_API_URL` in the `environment` section
- **Production**: API requests are proxied through Nginx to the backend service

## Building for Production Manually

If you want to build the frontend manually:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# The built files will be in the 'dist' directory
```

## Nginx Configuration

The production environment uses Nginx to:

1. Serve static files
2. Handle SPA routing (forwarding all routes to index.html)
3. Proxy API requests to the backend service
4. Set appropriate caching headers
5. Enable gzip compression

### Key Nginx Features

- **Single Page Application Support**: All routes are directed to index.html
- **Asset Caching**: Static assets (JS, CSS, images) are cached for improved performance
- **API Proxying**: Backend API requests are proxied seamlessly
- **WebSocket Support**: WebSocket connections for real-time features
- **Compression**: Gzip compression reduces file sizes

## Troubleshooting

### Development Issues

- **Hot reload not working**: Check that the volume mapping is correct in docker-compose.yml
- **API calls failing**: Ensure the backend service is running and the VUE_APP_API_URL is set correctly

### Production Issues

- **Blank page**: Check browser console for script errors; verify the build was successful
- **404 errors**: Make sure the Nginx configuration is properly handling your routes
- **API calls failing**: Check the Nginx logs to see if proxy requests are being forwarded correctly

Check logs:
```bash
# Development frontend logs
docker-compose logs frontend

# Production frontend/Nginx logs
docker-compose logs frontend-prod
```

## Switching Between Development and Production

To switch between environments:

1. Edit `docker-compose.yml`
2. Comment out the environment you don't need
3. Uncomment the environment you want to use
4. Restart the services:
   ```bash
   docker-compose down
   docker-compose up -d
   ```