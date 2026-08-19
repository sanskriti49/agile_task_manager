const assert = require("node:assert");
const { app, server } = require("../server");
const { pool, runMigrations } = require("../config/db");
const connectMongo = require("../config/mongo");

let authToken = null;
let testUser = null;
let testProject = null;
let testSprint = null;
let testTask1 = null;
let testTask2 = null;
let serverInstance = null;
let baseUrl = "";

async function makeRequest(path, options = {}) {
	const url = `${baseUrl}${path}`;
	const headers = {
		"Content-Type": "application/json",
		...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
		...(options.headers || {}),
	};

	const res = await fetch(url, {
		method: options.method || "GET",
		headers,
		body: options.body ? JSON.stringify(options.body) : undefined,
	});

	const data = await res.json().catch(() => null);
	return { status: res.status, data };
}

async function runAllTests() {
	console.log("🧪 Starting Automated Agile API Tests...\n");

	await runMigrations();
	await connectMongo();

	await new Promise((resolve) => {
		serverInstance = server.listen(0, "127.0.0.1", () => {
			const port = serverInstance.address().port;
			baseUrl = `http://127.0.0.1:${port}`;
			console.log(`📡 Test server listening at ${baseUrl}\n`);
			resolve();
		});
	});

	try {
		// 1. Auth & Signup
		console.log("▶ 1. Testing Authentication (Signup, Login, Validation)...");
		const email = `testuser_${Date.now()}@flux.dev`;
		const signupRes = await makeRequest("/api/auth/signup", {
			method: "POST",
			body: { name: "Test Developer", email, password: "TestPassword123!" },
		});
		assert.strictEqual(signupRes.status, 201, "Signup should return 201");
		assert.ok(signupRes.data.token, "Signup should return JWT");

		const loginRes = await makeRequest("/api/auth/login", {
			method: "POST",
			body: { email, password: "TestPassword123!" },
		});
		assert.strictEqual(loginRes.status, 200, "Login should return 200");
		assert.ok(loginRes.data.token, "Login should return JWT");
		authToken = loginRes.data.token;
		testUser = loginRes.data.user;

		const invalidLogin = await makeRequest("/api/auth/login", {
			method: "POST",
			body: { email, password: "wrongpassword" },
		});
		assert.strictEqual(invalidLogin.status, 401, "Invalid password should return 401");
		console.log("  ✅ Authentication passed\n");

		// 2. RBAC & Auth Guard
		console.log("▶ 2. Testing Authorization & RBAC Guard...");
		const unauthRes = await makeRequest("/api/projects");
		assert.strictEqual(unauthRes.status, 401, "Unauthenticated request should return 401");
		console.log("  ✅ Authorization guard passed\n");

		// 3. Project Creation
		console.log("▶ 3. Testing Project/Workspace Creation & Membership...");
		const projRes = await makeRequest("/api/projects", {
			method: "POST",
			token: authToken,
			body: { name: "Automated Test Project", description: "CI/CD test project" },
		});
		assert.strictEqual(projRes.status, 201, "Project creation should return 201");
		testProject = projRes.data;

		const listProj = await makeRequest("/api/projects", { token: authToken });
		assert.strictEqual(listProj.status, 200);
		assert.ok(listProj.data.some((p) => p.id === testProject.id));
		console.log("  ✅ Projects creation & listing passed\n");

		// 4. Sprints Lifecycle & Constraints
		console.log("▶ 4. Testing Sprint Lifecycle & Single Active Sprint Rule...");
		const sprint1Res = await makeRequest(`/api/projects/${testProject.id}/sprints`, {
			method: "POST",
			token: authToken,
			body: { name: "Sprint Alpha", goal: "Initial cycle" },
		});
		assert.strictEqual(sprint1Res.status, 201);
		testSprint = sprint1Res.data;

		// Start Sprint 1
		const startRes = await makeRequest(
			`/api/projects/${testProject.id}/sprints/${testSprint.id}/start`,
			{ method: "PATCH", token: authToken },
		);
		assert.strictEqual(startRes.status, 200);
		assert.strictEqual(startRes.data.status, "active");

		// Create Sprint 2 and try starting it while Sprint 1 is active -> 400
		const sprint2Res = await makeRequest(`/api/projects/${testProject.id}/sprints`, {
			method: "POST",
			token: authToken,
			body: { name: "Sprint Beta", goal: "Second cycle" },
		});
		const startConflict = await makeRequest(
			`/api/projects/${testProject.id}/sprints/${sprint2Res.data.id}/start`,
			{ method: "PATCH", token: authToken },
		);
		assert.strictEqual(startConflict.status, 400, "Should prevent second active sprint");

		// Complete Sprint 1
		const completeRes = await makeRequest(
			`/api/projects/${testProject.id}/sprints/${testSprint.id}/complete`,
			{ method: "PATCH", token: authToken },
		);
		assert.strictEqual(completeRes.status, 200);
		assert.strictEqual(completeRes.data.status, "completed");
		console.log("  ✅ Sprint lifecycle & active constraint passed\n");

		// 5. Tasks Creation & Lifecycle
		console.log("▶ 5. Testing Task Creation, Story Points, Tags, & Status Updates...");
		const task1Res = await makeRequest("/api/tickets", {
			method: "POST",
			token: authToken,
			body: {
				projectId: testProject.id,
				title: "Implement High-Throughput Queue",
				status: "todo",
				priority: "high",
				story_points: 5,
				tags: ["Backend", "Performance"],
			},
		});
		assert.strictEqual(task1Res.status, 201);
		assert.ok(task1Res.data.task_key);
		assert.strictEqual(task1Res.data.story_points, 5);
		testTask1 = task1Res.data;

		const task2Res = await makeRequest("/api/tickets", {
			method: "POST",
			token: authToken,
			body: {
				projectId: testProject.id,
				title: "Consume Queue Messages",
				status: "backlog",
				priority: "medium",
				story_points: 3,
			},
		});
		assert.strictEqual(task2Res.status, 201);
		testTask2 = task2Res.data;

		const updateTask = await makeRequest(`/api/tickets/${testTask1.id}`, {
			method: "PATCH",
			token: authToken,
			body: { status: "inprogress" },
		});
		assert.strictEqual(updateTask.status, 200);
		assert.strictEqual(updateTask.data.status, "inprogress");
		console.log("  ✅ Task creation & updates passed\n");

		// 6. Dependencies & Cycle Check
		console.log("▶ 6. Testing Task Dependencies & Cycle Prevention...");
		const depRes = await makeRequest(`/api/tickets/${testTask1.id}/dependencies`, {
			method: "POST",
			token: authToken,
			body: { dependsOnTaskId: testTask2.id, dependencyType: "blocks" },
		});
		assert.strictEqual(depRes.status, 201);

		const cycleRes = await makeRequest(`/api/tickets/${testTask2.id}/dependencies`, {
			method: "POST",
			token: authToken,
			body: { dependsOnTaskId: testTask1.id, dependencyType: "blocks" },
		});
		assert.strictEqual(cycleRes.status, 400, "Circular dependency should return 400");
		console.log("  ✅ Task dependencies & cycle checks passed\n");

		// 7. Subtasks
		console.log("▶ 7. Testing Subtasks CRUD...");
		const subRes = await makeRequest(`/api/tickets/${testTask1.id}/subtasks`, {
			method: "POST",
			token: authToken,
			body: { title: "Set up queue partitioner" },
		});
		assert.strictEqual(subRes.status, 201);
		assert.strictEqual(subRes.data.is_completed, false);

		const toggleSub = await makeRequest(
			`/api/tickets/${testTask1.id}/subtasks/${subRes.data.id}`,
			{ method: "PATCH", token: authToken, body: { is_completed: true } },
		);
		assert.strictEqual(toggleSub.status, 200);
		assert.strictEqual(toggleSub.data.is_completed, true);
		console.log("  ✅ Subtasks operations passed\n");

		// 8. Global Search & Analytics
		console.log("▶ 8. Testing Global Search & Analytics Endpoints...");
		const searchRes = await makeRequest("/api/search?q=Throughput", { token: authToken });
		assert.strictEqual(searchRes.status, 200);
		assert.ok(searchRes.data.tasks.some((t) => t.id === testTask1.id));

		const analyticsRes = await makeRequest(
			`/api/analytics/projects/${testProject.id}/analytics`,
			{ token: authToken },
		);
		assert.strictEqual(analyticsRes.status, 200);
		assert.ok(analyticsRes.data.summary);

		const myWorkRes = await makeRequest("/api/analytics/my-work", { token: authToken });
		assert.strictEqual(myWorkRes.status, 200);
		assert.ok(myWorkRes.data.stats);
		console.log("  ✅ Search & Analytics passed\n");

		console.log("🎉 ALL 8 TEST SUITES PASSED WITH 100% SUCCESS!");
	} catch (err) {
		console.error("❌ Test suite failed:", err);
		process.exitCode = 1;
	} finally {
		if (serverInstance) serverInstance.close();
		await pool.end().catch(() => {});
		process.exit(process.exitCode || 0);
	}
}

runAllTests();
