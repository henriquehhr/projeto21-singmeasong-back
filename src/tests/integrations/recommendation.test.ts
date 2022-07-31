import supertest from "supertest";

import app from "../../app.js";
import {prisma} from "../../database.js";
import { createRecommendation, newRecommendationInput, newInvalidInput } from "./factories/recommendationFactory.js";
import { createScenarioTenRecommendations, createScenarioTenRecommendationsDifferentScores } from "./factories/scenarioFactory.js";

const agent = supertest(app);

beforeEach( async () => {
  await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
});

describe("POST /recommendations", () => {

  it("given a valid recommendation, it should return 201", async () => {
    const result = await agent.post("/recommendations").send(newRecommendationInput());
    expect(result.status).toEqual(201);
  });

  it("given a valid recommendation, it should create a row in database", async () => {
    const recommendation = newRecommendationInput();
    await agent.post("/recommendations").send(recommendation);
    const result = await prisma.recommendation.findUnique({
      where: {name: recommendation.name}
    });
    expect(result.name).toEqual(recommendation.name);
  });

  it("given an invalid recommendation, it should return 422", async () => {
    const result = await agent.post("/recommendations").send(newInvalidInput());
    expect(result.status).toEqual(422);
  });

  it("given an invalid recommendation, it shouldn't create a row in database", async () => {
    await agent.post("/recommendations").send(newInvalidInput());
    const result = await prisma.recommendation.findUnique({
      where: {name: newInvalidInput().name}
    });
    expect(result).toBeNull();
  });

  it("given a repeated recommendation name, it should return 409", async () => {
    const recommendation = newRecommendationInput();
    await agent.post("/recommendations").send(recommendation);
    const result = await agent.post("/recommendations").send(recommendation);
    expect(result.status).toEqual(409);
  });

  it("given a repeated recommendation name, it shouldn't create a row in database", async () => {
    const recommendation = newRecommendationInput();
    await agent.post("/recommendations").send(recommendation);
    await agent.post("/recommendations").send(recommendation);
    const result = await prisma.recommendation.findMany({
      where: {name: recommendation.name}
    });
    expect(result.length).toEqual(1);
  });

});

describe("GET /recommendations", () => {
  
  it("given no recommendations, should return empty array", async () => {
    const result = await agent.get("/recommendations");
    expect(result.body.length).toEqual(0);
  });

  it("should return 10 recommendations", async () => {
    await createScenarioTenRecommendations();
    const result = await agent.get("/recommendations");
    expect(result.body.length).toEqual(10);
  });

});

describe("GET /recommendations/random", () => {
  
  it("given no recommendations, should return 404", async () => {
    const result = await agent.get("/recommendations/random");
    expect(result.statusCode).toEqual(404);
  });

  it("should return a recommendation", async () => {
    await createScenarioTenRecommendations();
    const result = await agent.get("/recommendations/random");
    console.log(result.body);
    expect(result.body).not.toEqual({});
  });

});

describe("GET /recommendations/top/:amount", () => {

  it("should return empty array", async () => {
    const result = await agent.get("/recommendations/top/1");
    expect(result.body.length).toStrictEqual(0);
  });

  it("should return top recommendation", async () => {
    await createScenarioTenRecommendationsDifferentScores();
    const result = await agent.get("/recommendations/top/1");
    expect(result.body[0].score).toStrictEqual(9);
  });

  it("should return top 5 recommendations", async () => {
    await createScenarioTenRecommendationsDifferentScores();
    const result = await agent.get("/recommendations/top/5");
    expect(result.body.length).toStrictEqual(5);
  });

});

describe("GET /recommendations/:id", () => {
  
  it("given the wrong id, it should return 404", async () => {
    const result = await agent.get("/recommendations/-1");
    expect(result.statusCode).toEqual(404);
  });

  it("should return recommendation", async () => {
    const recommendation = await createRecommendation();
    const result = await agent.get("/recommendations/" + recommendation.id);
    expect(result.body).toEqual(recommendation);
  });

});

describe("POST /recommendations/:id/downvote", () => {
  
  it("given the wrong id, it should return 404", async () => {
    const result = await agent.get("/recommendations/-1/downvote");
    expect(result.statusCode).toEqual(404);
  });

  it("should downvote recommendation", async () => {
    const recommendation = await createRecommendation();
    await agent.post(`/recommendations/${recommendation.id}/downvote`);
    const downvotedRecommendation = await prisma.recommendation.findUnique({where: {id: recommendation.id}});
    expect(downvotedRecommendation.score + 1).toEqual(recommendation.score);
  });

  it("should remove recommendation", async () => {
    const recommendation = await createRecommendation();
    await agent.post(`/recommendations/${recommendation.id}/downvote`);
    await agent.post(`/recommendations/${recommendation.id}/downvote`);
    await agent.post(`/recommendations/${recommendation.id}/downvote`);
    await agent.post(`/recommendations/${recommendation.id}/downvote`);
    await agent.post(`/recommendations/${recommendation.id}/downvote`);
    await agent.post(`/recommendations/${recommendation.id}/downvote`);
    const downvotedRecommendation = await prisma.recommendation.findUnique({where: {id: recommendation.id}});
    expect(downvotedRecommendation).toBeNull();
  });

});

describe("POST /recommendations/:id/upvote", () => {

  it("given the wrong id, it should return 404", async () => {
    const result = await agent.get("/recommendations/-1/upvote");
    expect(result.statusCode).toEqual(404);
  });

  it("should upvote recommendation", async () => {
    const recommendation = await createRecommendation();
    await agent.post(`/recommendations/${recommendation.id}/upvote`);
    const upvotedRecommendation = await prisma.recommendation.findUnique({where: {id: recommendation.id}});
    expect(upvotedRecommendation.score - 1).toEqual(recommendation.score);
  });

});

afterAll(async () => {
  await prisma.$disconnect();
});