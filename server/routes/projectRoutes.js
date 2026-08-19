const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const sprintRoutes = require("./sprintRoutes");
const { authenticate, requireProjectMember } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

router.use(authenticate);

// Search users across the platform
router.get("/users/search", asyncHandler(projectController.searchAllUsers));

// Nested sprint routes: /api/projects/:projectId/sprints
router.use("/:projectId/sprints", sprintRoutes);

// Get all projects for logged-in user dashboard & Create new project
router
	.route("/")
	.get(asyncHandler(projectController.getUserProjects))
	.post(asyncHandler(projectController.createProject));

// Single project board data, update, delete
router
	.route("/:projectId")
	.get(requireProjectMember, asyncHandler(projectController.getProjectById))
	.patch(requireProjectMember, asyncHandler(projectController.updateProject))
	.delete(requireProjectMember, asyncHandler(projectController.deleteProject));

// Project Team Members
router.post(
	"/:projectId/members",
	requireProjectMember,
	asyncHandler(projectController.addProjectMember),
);

router
	.route("/:projectId/members/:userId")
	.patch(requireProjectMember, asyncHandler(projectController.updateMemberRole))
	.delete(requireProjectMember, asyncHandler(projectController.removeProjectMember));

// WIP limits
router.put(
	"/:projectId/wip-limits",
	requireProjectMember,
	asyncHandler(projectController.setWipLimits),
);

module.exports = router;
