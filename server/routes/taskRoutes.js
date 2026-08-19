const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { authenticate, requireProjectMember } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

router.use(authenticate);

// Create task
router.post(
	"/",
	requireProjectMember,
	asyncHandler(taskController.createTicket),
);

// Get single task details
router.get(
	"/:taskId",
	requireProjectMember,
	asyncHandler(taskController.getTaskById),
);

// Update task details
router.patch(
	"/:taskId",
	requireProjectMember,
	asyncHandler(taskController.updateTicket),
);

// Delete task
router.delete(
	"/:taskId",
	requireProjectMember,
	asyncHandler(taskController.deleteTicket),
);

// Drag & drop move task
router.patch(
	"/:taskId/move",
	requireProjectMember,
	asyncHandler(taskController.moveTask),
);

// Comments
router.post(
	"/:taskId/comments",
	requireProjectMember,
	asyncHandler(taskController.addComment),
);

// Subtasks
router.post(
	"/:taskId/subtasks",
	requireProjectMember,
	asyncHandler(taskController.addSubtask),
);

router.patch(
	"/:taskId/subtasks/:subtaskId",
	requireProjectMember,
	asyncHandler(taskController.updateSubtask),
);

router.delete(
	"/:taskId/subtasks/:subtaskId",
	requireProjectMember,
	asyncHandler(taskController.deleteSubtask),
);

// Dependencies
router.post(
	"/:taskId/dependencies",
	requireProjectMember,
	asyncHandler(taskController.addDependency),
);

router.delete(
	"/:taskId/dependencies/:dependencyId",
	requireProjectMember,
	asyncHandler(taskController.removeDependency),
);

module.exports = router;
