import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

// OpenClaw webhook endpoint
http.route({
	path: "/openclaw/event",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		const body = await request.json();
		await ctx.runMutation(api.openclaw.receiveAgentEvent, body);
		return new Response(JSON.stringify({ ok: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	}),
});

// Approval request endpoint
http.route({
	path: "/approvals/request",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		try {
			const body = await request.json();
			const { type, title, description, agentId, agentName, taskId, metadata, expiresInMs, tenantId } = body;

			if (!type || !title || !description) {
				return new Response(
					JSON.stringify({ error: "Missing required fields: type, title, description" }),
					{ status: 400, headers: { "Content-Type": "application/json" } }
				);
			}

			const approvalId = await ctx.runMutation(api.approvals.create, {
				tenantId: tenantId || "default",
				type,
				title,
				description,
				agentId,
				agentName,
				taskId,
				metadata,
				expiresInMs,
			});

			return new Response(
				JSON.stringify({ ok: true, approvalId }),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		} catch (error) {
			return new Response(
				JSON.stringify({ error: String(error) }),
				{ status: 500, headers: { "Content-Type": "application/json" } }
			);
		}
	}),
});

// Check approval status endpoint
http.route({
	path: "/approvals/status",
	method: "GET",
	handler: httpAction(async (ctx, request) => {
		try {
			const url = new URL(request.url);
			const approvalId = url.searchParams.get("id");

			if (!approvalId) {
				return new Response(
					JSON.stringify({ error: "Missing id parameter" }),
					{ status: 400, headers: { "Content-Type": "application/json" } }
				);
			}

			const approval = await ctx.runQuery(api.approvals.get, {
				approvalId: approvalId as any,
			});

			if (!approval) {
				return new Response(
					JSON.stringify({ error: "Approval not found" }),
					{ status: 404, headers: { "Content-Type": "application/json" } }
				);
			}

			return new Response(
				JSON.stringify({
					id: approval._id,
					status: approval.status,
					resolvedAt: approval.resolvedAt,
					resolvedBy: approval.resolvedBy,
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		} catch (error) {
			return new Response(
				JSON.stringify({ error: String(error) }),
				{ status: 500, headers: { "Content-Type": "application/json" } }
			);
		}
	}),
});

// Create task endpoint
http.route({
	path: "/tasks/create",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		try {
			const body = await request.json();
			const { title, description, status, tags, projectId, tenantId } = body;

			if (!title) {
				return new Response(
					JSON.stringify({ error: "Missing required field: title" }),
					{ status: 400, headers: { "Content-Type": "application/json" } }
				);
			}

			const taskId = await ctx.runMutation(api.tasks.createTask, {
				title,
				description: description || title,
				status: status || "inbox",
				tags: tags || [],
				projectId,
				tenantId: tenantId || "default",
			});

			return new Response(
				JSON.stringify({ ok: true, taskId }),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		} catch (error) {
			return new Response(
				JSON.stringify({ error: String(error) }),
				{ status: 500, headers: { "Content-Type": "application/json" } }
			);
		}
	}),
});

// Update task status endpoint
http.route({
	path: "/tasks/status",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		try {
			const body = await request.json();
			const { taskId, status, tenantId } = body;

			if (!taskId || !status) {
				return new Response(
					JSON.stringify({ error: "Missing required fields: taskId, status" }),
					{ status: 400, headers: { "Content-Type": "application/json" } }
				);
			}

			// Direct patch without agent requirement for API calls
			await ctx.runMutation(api.tasks.updateStatusSimple, {
				taskId,
				status,
				tenantId: tenantId || "default",
			});

			return new Response(
				JSON.stringify({ ok: true }),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		} catch (error) {
			return new Response(
				JSON.stringify({ error: String(error) }),
				{ status: 500, headers: { "Content-Type": "application/json" } }
			);
		}
	}),
});

// Log activity endpoint
http.route({
	path: "/activity/log",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		try {
			const body = await request.json();
			const { type, message, agentName, targetId, tenantId } = body;

			if (!type || !message) {
				return new Response(
					JSON.stringify({ error: "Missing required fields: type, message" }),
					{ status: 400, headers: { "Content-Type": "application/json" } }
				);
			}

			await ctx.runMutation(api.activity.logSimple, {
				type,
				message,
				agentName: agentName || "unknown",
				targetId,
				tenantId: tenantId || "default",
			});

			return new Response(
				JSON.stringify({ ok: true }),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		} catch (error) {
			return new Response(
				JSON.stringify({ error: String(error) }),
				{ status: 500, headers: { "Content-Type": "application/json" } }
			);
		}
	}),
});

export default http;
