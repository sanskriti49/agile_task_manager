const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { authenticate, requireProjectMember } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

router.use(authenticate);

router.post(
	"/",
	requireProjectMember,
	asyncHandler(taskController.createTicket),
);

router.patch(
	"/:taskId/move",
	requireProjectMember,
	asyncHandler(taskController.moveTask),
);

router.post(
	"/:taskId/comments",
	requireProjectMember,
	asyncHandler(taskController.addComment),
);

module.exports = router;
