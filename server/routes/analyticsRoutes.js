const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const { authenticate, requireProjectMember } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

router.use(authenticate);

// Personal My Work view
router.get("/my-work", asyncHandler(analyticsController.getMyWork));

// Project Dashboard analytics
router.get(
	"/projects/:projectId/analytics",
	requireProjectMember,
	asyncHandler(analyticsController.getProjectAnalytics),
);

module.exports = router;
