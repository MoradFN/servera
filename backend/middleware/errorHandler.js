export function errorHandler(err, req, res, next) {
  const trackingId = Date.now(); // Simple tracking ID

  if (err.status === 404) {
    console.error(`💩404 Error [${trackingId}]:💩`, err.message);
    return res.status(404).json({
      success: false,
      message: "💩404-Not Found💩",
      trackingId,
    });
  }

  console.error(`💩Error [${trackingId}]:💩`, err.stack);
  res
    .status(500)
    .json({ success: false, message: "💩Internal Server Error💩", trackingId });
}
