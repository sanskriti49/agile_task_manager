const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
	{
		projectId: {
			type: String,
			required: true,
			index: true,
		},
		taskId: {
			type: String,
			required: false,
			default: null,
			index: true,
		},
		userId: {
			type: String,
			required: true,
		},
		userName: {
			type: String,
			default: "Unknown",
		},
		action: {
			type: String,
			enum: [
				"TASK_CREATED",
				"TASK_UPDATED",
				"TASK_DELETED",
				"STATUS_CHANGE",
				"ASSIGNMENT_CHANGE",
				"PRIORITY_CHANGE",
				"COMMENT_ADDED",
				"COMMENT_DELETED",
				"PROJECT_MEMBER_ADDED",
				"PROJECT_MEMBER_REMOVED",
				"SPRINT_CREATED",
				"SPRINT_STARTED",
				"SPRINT_COMPLETED",
				"SUBTASK_CREATED",
				"SUBTASK_UPDATED",
				"SUBTASK_DELETED",
				"DEPENDENCY_ADDED",
				"DEPENDENCY_REMOVED",
				"LABEL_ADDED",
			],
			required: true,
		},
		message: {
			type: String,
			default: "",
		},
		oldValue: {
			type: mongoose.Schema.Types.Mixed,
		},
		newValue: {
			type: mongoose.Schema.Types.Mixed,
		},
	},
	{
		timestamps: true,
	},
);
activityLogSchema.index({ projectId: 1, createdAt: -1 });
//activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
