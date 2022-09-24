import { faker } from "@faker-js/faker";

export function recommendationFactory() {
  const name = faker.lorem.words(2);
  const youtubeLink = `https://www.youtube.com/watch`;

  return { name, youtubeLink };
}
