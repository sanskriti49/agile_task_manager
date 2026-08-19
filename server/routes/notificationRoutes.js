const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { authenticate } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

router.use(authenticate);

router.get("/", asyncHandler(notificationController.getUserNotifications));
router.patch("/read-all", asyncHandler(notificationController.markAllAsRead));
router.patch("/:id/read", asyncHandler(notificationController.markAsRead));

module.exports = router;
