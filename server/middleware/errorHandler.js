const asyncHandler = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};

const errorHandler = (err, req, res, next) => {
	console.error("Error Handler Caught:", err.stack || err);

	const statusCode = err.statusCode || 500;
	res.status(statusCode).json({
		message: err.message || "Internal Server Error",
		...(process.env.NODE_ENV === "development" && { stack: err.stack }),
	});
};

module.exports = { asyncHandler, errorHandler };
