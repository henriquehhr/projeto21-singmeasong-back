import supertest from "supertest";

import app from "../../app.js";
import {prisma} from "../../database.js";

const agent = supertest(app);

const validInput = {
	"name": "Falamansa - Xote dos Milagres",
	"youtubeLink": "https://www.youtube.com/watch?v=chwyjJbcs1Y"
};

const invalidInput = {
	"name": "Falamansa - Xote dos Milagres",
	"youtuubeLink": "https://www.youtube.com/watch?v=chwyjJbcs1Y"
};

beforeEach( async () => {
  await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
});

describe("POST /recommendations", () => {

  it("given a valid recommendation, it should return 201", async () => {
    const result = await agent.post("/recommendations").send(validInput);
    expect(result.status).toEqual(201);
  });

  it("given a valid recommendation, it should create a row in database", async () => {
    await agent.post("/recommendations").send(validInput);
    const result = await prisma.recommendation.findUnique({
      where: {name: validInput.name}
    });
    expect(result.name).toEqual(validInput.name);
  });

  it("given an invalid recommendation, it should return 422", async () => {
    const result = await agent.post("/recommendations").send(invalidInput);
    expect(result.status).toEqual(422);
  });

  it("given an invalid recommendation, it shouldn't create a row in database", async () => {
    await agent.post("/recommendations").send(invalidInput);
    const result = await prisma.recommendation.findUnique({
      where: {name: invalidInput.name}
    });
    expect(result).toBeNull();
  });

  it("given a repeated recommendation name, it should return 409", async () => {
    await agent.post("/recommendations").send(validInput);
    const result = await agent.post("/recommendations").send(validInput);
    expect(result.status).toEqual(409);
  });

  it("given a repeated recommendation name, it shouldn't create a row in database", async () => {
    await agent.post("/recommendations").send(validInput);
    await agent.post("/recommendations").send(validInput);
    const result = await prisma.recommendation.findMany({
      where: {name: invalidInput.name}
    });
    expect(result.length).toEqual(1);
  });

});

describe("POST /recommendations/:id/upvote", () => {

  it("", async () => {
    
  });

});

afterAll(async () => {
  await prisma.$disconnect();
});