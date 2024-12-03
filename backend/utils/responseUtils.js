export const sendSuccessResponse = (
  res,
  message,
  data = null,
  statusCode = 200
) => {
  const response = { success: true, message };
  if (data !== null) {
    response.data = Array.isArray(data) && data.length === 0 ? [] : data;
  }
  res.status(statusCode).json(response);
};

//   export const sendSuccessResponse = (
//     res,
//     message,
//     data = {},
//     statusCode = 200
//   ) => {
//     res.status(statusCode).json({
//       success: true,
//       message,
//       data,
//     });
//   };

//   export const sendSuccessResponse = (
//     res,
//     message,
//     data = null,
//     statusCode = 200
//   ) => {
//     const response = { success: true, message };
//     if (data !== null) response.data = data;
//     res.status(statusCode).json(response);
//   };
