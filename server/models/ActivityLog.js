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
			required: true,
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
				"STATUS_CHANGE",
				"ASSIGNMENT_CHANGE",
				"COMMENT_ADDED",
				"COMMENT_DELETED",
				"PROJECT_MEMBER_ADDED",
				"PROJECT_MEMBER_REMOVED",
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

module.exports = mongoose.model("ActivityLog", activityLogSchema);
