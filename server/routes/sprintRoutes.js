const express = require("express");
const router = express.Router({ mergeParams: true });
const sprintController = require("../controllers/sprintController");
const { authenticate, requireProjectMember } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

router.use(authenticate);

router
	.route("/")
	.get(requireProjectMember, asyncHandler(sprintController.getProjectSprints))
	.post(requireProjectMember, asyncHandler(sprintController.createSprint));

router.patch(
	"/:sprintId/start",
	requireProjectMember,
	asyncHandler(sprintController.startSprint),
);

router.patch(
	"/:sprintId/complete",
	requireProjectMember,
	asyncHandler(sprintController.completeSprint),
);

router.get(
	"/:sprintId/burndown",
	requireProjectMember,
	asyncHandler(sprintController.getSprintBurndown),
);

module.exports = router;
