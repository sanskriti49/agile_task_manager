const ActivityLog = require("../models/ActivityLog");

/* ------------------------------------------------------------------ */
/* GET PROJECT ACTIVITY TIMELINE                                       */
/* Endpoint: GET /api/activity-logs/:projectId                        */
/* ------------------------------------------------------------------ */
exports.getProjectActivities = async (req, res) => {
	const { projectId } = req.params;
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 30;
	const skip = (page - 1) * limit;

	try {
		const total = await ActivityLog.countDocuments({ projectId });
		const logs = await ActivityLog.find({ projectId })
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean();

		// Transform and format activities into rich human-readable events
		const formatted = logs.map((log) => {
			let humanText = log.message;
			if (!humanText) {
				switch (log.action) {
					case "TASK_CREATED":
						humanText = `Created ticket "${log.newValue?.title || "Task"}"`;
						break;
					case "STATUS_CHANGE":
						humanText = `Moved task from ${log.oldValue?.status || "old"} to ${log.newValue?.status || "new"}`;
						break;
					case "PRIORITY_CHANGE":
						humanText = `Changed priority to ${log.newValue?.priority}`;
						break;
					case "ASSIGNMENT_CHANGE":
						humanText = `Updated assignment`;
						break;
					case "COMMENT_ADDED":
						humanText = `Added a comment`;
						break;
					case "SPRINT_CREATED":
						humanText = `Created sprint "${log.newValue?.name || ""}"`;
						break;
					case "SPRINT_STARTED":
						humanText = `Started sprint "${log.newValue?.name || ""}"`;
						break;
					case "SPRINT_COMPLETED":
						humanText = `Completed sprint "${log.newValue?.name || ""}"`;
						break;
					case "PROJECT_MEMBER_ADDED":
						humanText = `Added member to project`;
						break;
					default:
						humanText = "Updated project item";
				}
			}

			return {
				...log,
				humanText,
			};
		});

		res.status(200).json({
			activities: formatted,
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		});
	} catch (err) {
		console.error("Fetch ActivityLog error:", err);
		res.status(500).json({ message: "Failed to load activity logs" });
	}
};
