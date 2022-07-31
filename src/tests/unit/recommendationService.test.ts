import { jest } from "@jest/globals";

import {CreateRecommendationData, recommendationService} from "../../services/recommendationsService.js";
import {recommendationRepository} from "../../repositories/recommendationRepository.js";
import { Recommendation } from "@prisma/client";

const createRecommendation: CreateRecommendationData = {
  name: "test recommendation",
  youtubeLink: "https://www.youtube.com/watch?v=2PPSXonhIck"
};

const existingRecommendation: Recommendation = {
  id: 1,
  name: "test recommendation",
  youtubeLink: "https://www.youtube.com/watch?v=2PPSXonhIck",
  score: 1
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

describe("insert", () => {

  it("should create recommendation", async () => {
    jest.spyOn(recommendationRepository, "findByName").mockImplementationOnce((): any => {return null});
    jest.spyOn(recommendationRepository, "create").mockImplementationOnce((): any => {});
    await recommendationService.insert(createRecommendation);
    expect(recommendationRepository.create).toBeCalled();
  });
  
  it("given a repeated name, shouldn't create recommendation", async () => {
    jest.spyOn(recommendationRepository, "findByName").mockImplementationOnce((): any => {return existingRecommendation});
    jest.spyOn(recommendationRepository, "create").mockImplementationOnce((): any => {});
    const promise = recommendationService.insert(createRecommendation);
    expect(promise).rejects.toEqual({type: "conflict", message: "Recommendations names must be unique"});
    expect(recommendationRepository.create).not.toBeCalled();
  });

});

describe("upvote", () => {

  it("should increment score", async () => {
    jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => existingRecommendation);
    jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce((): any => {});
    await recommendationService.upvote(1);
    expect(recommendationRepository.updateScore).toBeCalled();
  });

  it("given an invalid id, shouldn't increment score", async () => {
    jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => null);
    jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce((): any => {});
    const promise = recommendationService.upvote(1);
    expect(promise).rejects.toEqual({type: "not_found", message: ""});
  });

});

describe("downvote", () => {
  
  it("should decrement score", async () => {
    jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => existingRecommendation);
    jest.spyOn(recommendationRepository, "updateScore").mockImplementation((): any => existingRecommendation);
    jest.spyOn(recommendationRepository, "remove").mockImplementationOnce((): any => {});
    await recommendationService.downvote(1);
    expect(recommendationRepository.updateScore).toBeCalled();
    expect(recommendationRepository.remove).not.toBeCalled();
  });

  it("should decrement score and remove recommendation", async () => {
    jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => existingRecommendation);
    existingRecommendation.score = -6;
    jest.spyOn(recommendationRepository, "updateScore").mockImplementation((): any => existingRecommendation);
    jest.spyOn(recommendationRepository, "remove").mockImplementationOnce((): any => {});
    await recommendationService.downvote(1);
    expect(recommendationRepository.updateScore).toBeCalled();
    expect(recommendationRepository.remove).toBeCalled();
  });

  it("given an invalid id, shouldn't decrement score", async () => {
    jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => null);
    jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce((): any => {});
    jest.spyOn(recommendationRepository, "remove").mockImplementationOnce((): any => {});
    const promise = recommendationService.downvote(1);
    expect(promise).rejects.toEqual({type: "not_found", message: ""});
    expect(recommendationRepository.remove).not.toBeCalled();
  });

});

describe("getById", () => {

  it("should return a recommendation", async () => {
    jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => existingRecommendation);
    const result = await recommendationService.getById(1);
    expect(result).toEqual(existingRecommendation);
  });

  it("given an invalid id, shouldn't return a recommendation", async () => {
    jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => null);
    const promise = recommendationService.getById(1);
    expect(promise).rejects.toEqual({type: "not_found", message: ""});
  });

});

describe("get", () => {

  it("should return an array of recommendations", async () => {
    jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce((): any => [existingRecommendation]);
    const result = await recommendationService.get();
    expect(result).toHaveLength(1);
  });

});

describe("getTop", () => {

  it("should return top recommendations", async () => {
    jest.spyOn(recommendationRepository, "getAmountByScore").mockImplementationOnce((): any => [existingRecommendation]);
    const result = await recommendationService.getTop(1);
    expect(result).toHaveLength(1);
  });

});

describe("getRandom", () => {

  it("should return random recommendations", async () => {
    jest.spyOn(Math, "random").mockImplementationOnce((): any => 0.3);
    jest.spyOn(Math, "floor").mockImplementationOnce((): any => 0);
    jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce((): any => [existingRecommendation]);
    const result = await recommendationService.getRandom();
    expect(result).toEqual(existingRecommendation);
  });

  it("given no registered recommendation , should throw not_found error", async () => {
    jest.spyOn(Math, "random").mockImplementationOnce((): any => 0.8);
    jest.spyOn(recommendationRepository, "findAll").mockImplementation((): any => []);
    const promise = recommendationService.getRandom();
    expect(promise).rejects.toEqual({type: "not_found", message: ""});
  });

});