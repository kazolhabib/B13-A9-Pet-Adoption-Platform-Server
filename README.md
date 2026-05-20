# PetHaven - Backend (Server-Side)

## Project Purpose
PetHaven is a comprehensive pet adoption platform built to connect loving families with animals in need. The backend system serves as the secure, high-performance foundation of the platform. It handles authentication, data management, advanced querying for pet listings, and adoption request lifecycle management.

## Live URL
[https://your-server-url.vercel.app](https://your-server-url.vercel.app)

## Features
- **Secure JWT Authentication**: Generates JSON Web Tokens securely stored in HTTPOnly cookies for seamless, protected route access.
- **Advanced Pet Filtering**: Supports advanced querying using MongoDB operators like `$regex` for partial name/breed matching and `$in` for multi-species filtering.
- **Adoption Request Management**: Handles the full lifecycle of adoption requests including approval and rejection logic, with built-in cascading updates (approving one request automatically rejects all other pending requests for that pet).
- **Owner Access Control**: Enforces strict validations preventing owners from requesting their own pets, and prevents unauthorized users from updating or deleting other users' listings.
- **RESTful API Architecture**: Provides a clean, standardized JSON response structure across all endpoints for easy frontend integration.

## NPM Packages Used
- `express`: Fast, unopinionated, minimalist web framework for routing and middleware.
- `mongoose`: Elegant MongoDB object modeling for schema definition and database interactions.
- `dotenv`: Loads environment variables securely.
- `cors`: Handles Cross-Origin Resource Sharing correctly to ensure frontend accessibility.
- `jsonwebtoken`: Used for generating and verifying secure session tokens.
- `cookie-parser`: Parses cookie header to easily retrieve the HTTPOnly JWT on private routes.
- `google-auth-library`: Verifies Google OAuth credential tokens securely on the backend.
