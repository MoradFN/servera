export function errorHandler(err, req, res, next) {
  const trackingId = Date.now(); // Simple tracking ID
  console.error(`Error [${trackingId}]:`, err.stack);
  res
    .status(500)
    .json({ success: false, message: "Internal Server Error", trackingId });
}
