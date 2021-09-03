import request from "supertest";
import server from "../src/index";
import { generateLog, deleteLog } from "./logsHelper";

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

    describe("GET /events", () => {
        beforeAll(async () => {
            await generateLog("./test/resources/fiveLinesLorem.log")
        });

        test("it orders by reverse time", async () => {
            const { text } = await agent
                .get(`/events`)
                .query({ file: `fiveLinesLorem.log` })

            expect(text).toBe(
                "5 - Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." +
                "4 - Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n" +
                "3 - Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n" +
                "2 - Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n" +
                "1 - Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n"
            )
        });

        test("it rejects wrong files", async () => {
            const { statusCode, text } = await agent
                .get(`/events`)
                .query({ file: `NonExistingFile` });

            expect(statusCode).toBe(404)
            expect(text).toBe('file not found')
        });

        test("it can't access other directories ", async () => {
            const { statusCode, text } = await agent
                .get(`/events`)
                .query({ file: `../integration.test.ts` });

            expect(statusCode).toBe(400)
            expect(text).toBe('invalid file path')
        });

        test("it has file is set", async () => {
            const { statusCode, text } = await agent
                .get(`/events`);

            expect(statusCode).toBe(400)
            expect(text).toBe('invalid file path')
        });

        test("it can limits the results when file is smaller than buffer", async () => {
            const { text } = await agent
                .get(`/events`)
                .query({ file: `fiveLinesLorem.log`, amount: 1 })

            expect(text).toBe(
                "5 - Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
            )
        });

        test("it can limits the results when file is bigger than buffer", async () => {
            await generateLog("./test/resources/100LinesLorem.log", 100)

            const { text } = await agent
                .get(`/events`)
                .query({ file: `100LinesLorem.log`, amount: 1 })

            expect(text).toBe(
                "100 - Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
            )

            await deleteLog("./test/resources/100LinesLorem.log")
        });

        test("it rejects non positive amounts", async () => {
            const { statusCode: statusCodeNegative, text: textNegative } = await agent
                .get(`/events`)
                .query({ file: `fiveLinesLorem.log`, amount: -10 })

            expect(statusCodeNegative).toBe(400)
            expect(textNegative).toBe('incorrect amount value')

            const { statusCode: statusCodeString, text: textString } = await agent
                .get(`/events`)
                .query({ file: `fiveLinesLorem.log`, amount: "test" })

            expect(statusCodeString).toBe(400)
            expect(textString).toBe('incorrect amount value')
        });

        test("it can filter", async () => {
            const { text } = await agent
                .get(`/events`)
                .query({ file: `fiveLinesLorem.log`, filter: "3" })

            expect(text).toBe(
                "3 - Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n"
            )
        });

        test("it can return from big single lined log", async () => {
            const { text: logText } = await generateLog("./test/resources/32kLinesLorem.log", 1, 32 * 1024)

            const { text } = await agent
                .get(`/events`)
                .query({ file: `32kLinesLorem.log` })

            expect(text).toBe(logText)

            await deleteLog("./test/resources/32kLinesLorem.log")
        });

        test("it can return from empty log", async () => {
            await generateLog("./test/resources/empty.log", 0)

            const { text } = await agent
                .get(`/events`)
                .query({ file: `empty.log` })

            expect(text).toBe("")
            await deleteLog("./test/resources/empty.log")
        });

        test("it can return no line jump logs", async () => {
            const { text: logText } = await generateLog("./test/resources/noJumps.log", 1, 1)
            const { text } = await agent
                .get(`/events`)
                .query({ file: `noJumps.log` })

            expect(text).toBe(logText)
            await deleteLog("./test/resources/noJumps.log")
        });

        test.skip("master requests data to all children by default", async () => { });
        test.skip("master requests data to given children", async () => { });

        afterAll(async () => {
            await deleteLog("./test/resources/fiveLinesLorem.log")
        })
    });

    afterEach(async () => {
        await server.close();
    });
});