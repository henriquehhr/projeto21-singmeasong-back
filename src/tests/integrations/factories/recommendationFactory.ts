import {faker} from "@faker-js/faker";

import {prisma} from "../../../database.js";

export async function createRecommendation () {
  const recommendation = {
    name: faker.name.findName(),
    youtubeLink: "https://www.youtube.com/watch?v=OgNcwvTUpBQ"
  };

  const insertedRecommendation = await prisma.recommendation.create({
		data: {
			name: recommendation.name,
			youtubeLink: recommendation.youtubeLink
		}
	});

  return insertedRecommendation;
}

export function newRecommendationInput(score?: number) {
  const recommendation = {
    name: faker.name.findName(),
    youtubeLink: "https://www.youtube.com/watch?v=OgNcwvTUpBQ"
  };
  if(score === undefined)
    return recommendation;
  else
    return {...recommendation, score};
}

export function newInvalidInput() {
  const recommendation = {
    name: faker.name.findName(),
    youuuutubeLink: "https://www.youtube.com/watch?v=OgNcwvTUpBQ"
  };
  return recommendation;
}