import { validationResult } from "express-validator";

const errorMessages = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  500: "Internal Server Error",
};

export function errorHandler(err, req, res, next) {
  const trackingId = Date.now();
  const status = err.status || 500;

  // Specific handling for 404 errors
  if (status === 404) {
    console.error(`💩404 Error [${trackingId}]:💩`, err.message);
    return res.status(404).json({
      success: false,
      message: "Custom 404 Message - Not Found 💩",
      trackingId,
    });
  }

  const message = errorMessages[status] || "Unknown Error";

  console.error(`💩Error [${trackingId}]:💩`, err.stack);

  res.status(status).json({
    success: false,
    message,
    trackingId,
    details: err.message,
  });
}

// Middleware for validation error handling
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((error) => ({
        field: error.param,
        message: error.msg,
      })),
    });
  }
  next();
};

//MTTODO: Förklaring för mig:
// Good observation! The behavior depends on how middleware is structured and invoked in your app.
// How Middleware Works with next():
// Middleware Sequence: Middleware is executed in the order it is registered in your app (using app.use or route-specific handlers).
// Validation Middleware: handleValidationErrors is a specific middleware that runs before hitting the controller logic. It does not use next(err) for validation errors. Instead, it sends an HTTP response directly if there are validation errors.
// Error Middleware: errorHandler is a general middleware for catching unhandled errors passed via next(err) in the app.
// Why They Don't Conflict:
// Validation Middleware: Stops the request if validation fails and sends a 400 Bad Request response. It doesn't invoke next(err) for validation issues because it's responsible for handling them.
// General Error Middleware: Only handles errors explicitly passed via next(err) from other parts of the app, like the controller or service layers.
