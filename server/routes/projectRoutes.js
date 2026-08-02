const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { authenticate, requireProjectMember } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

router.use(authenticate);

// get all projects for logged-in user dashboard & Create new project
router
	.route("/")
	.get(asyncHandler(projectController.getUserProjects))
	.post(asyncHandler(projectController.createProject));

// get single project board data (Requires user to be project member)
router
	.route("/:projectId")
	.get(requireProjectMember, asyncHandler(projectController.getProjectById))
	.patch(requireProjectMember, asyncHandler(projectController.updateProject));

// add team member to project
router.post(
	"/:projectId/members",
	requireProjectMember,
	asyncHandler(projectController.addProjectMember),
);

module.exports = router;
