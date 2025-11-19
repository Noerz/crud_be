# Error Handling Middleware

Sistem error handling yang komprehensif untuk CRUD API.

## Fitur

- **Custom Error Classes** - Error classes dengan status code yang tepat
- **Sequelize Error Handler** - Otomatis menangani error dari database
- **JWT Error Handler** - Menangani error token authentication
- **Async Handler** - Wrapper untuk async functions
- **Development vs Production Mode** - Error response berbeda per environment

## Custom Error Classes

### Cara Penggunaan

```javascript
const { NotFoundError, UnauthorizedError, ConflictError } = require("../middleware/errorHandler");

// Di service atau controller
if (!user) {
  throw new NotFoundError("User not found");
}

if (!isValid) {
  throw new UnauthorizedError("Invalid credentials");
}

if (emailExists) {
  throw new ConflictError("Email already exists");
}
```

### Available Error Classes

| Class | Status Code | Deskripsi |
|-------|-------------|-----------|
| `ValidationError` | 400 | Bad Request / Validation error |
| `UnauthorizedError` | 401 | Unauthorized access |
| `ForbiddenError` | 403 | Access forbidden |
| `NotFoundError` | 404 | Resource not found |
| `ConflictError` | 409 | Resource conflict (duplicate) |
| `InternalServerError` | 500 | Server error |
| `AppError` | Custom | Generic error (bisa set status sendiri) |

## Async Handler

Wrapper otomatis untuk menangkap error dari async functions.

```javascript
const { asyncHandler } = require("../middleware/errorHandler");

// Sebelum (manual try-catch)
const getUser = async (req, res, next) => {
  try {
    const user = await findUser(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Sesudah (dengan asyncHandler)
const getUser = asyncHandler(async (req, res) => {
  const user = await findUser(req.params.id);
  res.json(user);
});
```

## Error Response Format

### Development Mode
```json
{
  "code": 404,
  "status": "fail",
  "message": "User not found",
  "stack": "Error: User not found\n    at ...",
  "error": { ... }
}
```

### Production Mode
```json
{
  "code": 404,
  "status": "fail",
  "message": "User not found"
}
```

## Automatic Error Handling

Error dari Sequelize dan JWT otomatis ditangani:

```javascript
// Sequelize Validation Error → 400 Bad Request
// Sequelize Unique Constraint → 409 Conflict
// JWT Invalid Token → 401 Unauthorized
// JWT Expired Token → 401 Unauthorized
```

## Setup di index.js

```javascript
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

// ... middleware lainnya ...

// API routes
app.use("/api/v1", routes);

// 404 handler (harus setelah semua routes)
app.use(notFoundHandler);

// Global error handler (harus paling akhir)
app.use(errorHandler);
```

## Best Practices

1. **Gunakan Custom Error Classes** di services
2. **Gunakan asyncHandler** di controllers
3. **Jangan handle error di controller** - biarkan middleware yang handle
4. **Set NODE_ENV** di production untuk response yang aman

```bash
# Development
NODE_ENV=development npm start

# Production
NODE_ENV=production npm start
```

## Contoh Implementasi Lengkap

### Service Layer
```javascript
const { NotFoundError, ConflictError } = require("../middleware/errorHandler");

async function registerUser({ email, password }) {
  const exists = await User.findOne({ where: { email } });
  if (exists) {
    throw new ConflictError("Email already exists");
  }
  
  const user = await User.create({ email, password });
  return user;
}
```

### Controller Layer
```javascript
const { asyncHandler } = require("../middleware/errorHandler");

const register = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await registerUser({ email, password });
  res.status(201).json({
    status: "success",
    data: user
  });
});
```

### Result
- Jika email duplikat → 409 Conflict response otomatis
- Jika ada error lain → 500 Internal Server Error
- Tidak perlu try-catch manual di controller
