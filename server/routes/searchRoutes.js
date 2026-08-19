const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController");
const { authenticate } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

router.use(authenticate);

router.get("/", asyncHandler(searchController.globalSearch));

module.exports = router;
