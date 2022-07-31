import {prisma} from "../../../database.js";
import { createRecommendation, newRecommendationInput } from "./recommendationFactory.js";

export async function createScenarioTenRecommendations() {
  const recommendations = [];
  for(let i = 0; i < 10; i++)
    recommendations.push(newRecommendationInput());
  await prisma.recommendation.createMany({data: recommendations});
}

export async function createScenarioTenRecommendationsDifferentScores() {
  const recommendations = [];
  for(let i = 0; i < 10; i++)
    recommendations.push(newRecommendationInput(i));
  await prisma.recommendation.createMany({data: recommendations});
}