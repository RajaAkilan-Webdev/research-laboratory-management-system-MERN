export function notFound(req, res) {
  res
    .status(404)
    .json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const status =
    error.name === "ValidationError" ||
    error.name === "SequelizeValidationError"
      ? 400
      : error.name === "CastError"
        ? 400
        : error.code === 11000 ||
            error.name === "SequelizeUniqueConstraintError"
          ? 409
          : error.name === "JsonWebTokenError" ||
              error.name === "TokenExpiredError"
            ? 401
            : error.status || 500;
  res
    .status(status)
    .json({ message: status === 500 ? "Server error." : error.message });
}
