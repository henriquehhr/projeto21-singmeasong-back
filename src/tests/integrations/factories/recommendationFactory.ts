import {faker} from "@faker-js/faker";

import {prisma} from "../../../src/database.js";

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