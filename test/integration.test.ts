import request from "supertest";
import server from "../src/index";

describe("Integration Tests", () => {
    let agent: request.SuperAgentTest;

    beforeEach(async () => {
        agent = request.agent(server);
    });

    describe("GET /health", () => {
        test("check service is up", async () => {
            await agent
                .get(`/health`)
                .expect(200, {
                    health: true
                })
        });
    });

    afterEach(async () => {
        await server.close();
    });
});