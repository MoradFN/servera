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
