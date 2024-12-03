export const sendSuccessResponse = (res, message, data = {}) => {
  res.status(201).json({
    success: true,
    message,
    ...data,
  });
};
