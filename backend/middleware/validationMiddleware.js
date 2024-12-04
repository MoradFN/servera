import { validationResult } from "express-validator";

// Middleware for validation error handling, MTTODO: can be reused for other purposes?
export const runValidations = (validations) => {
  return async (req, res, next) => {
    try {
      await Promise.all(validations.map((validation) => validation.run(req)));

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
    } catch (err) {
      next(err); // Delegate unexpected errors to the global error handler
    }
  };
};
