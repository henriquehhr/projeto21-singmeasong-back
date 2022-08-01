import { recommendationRepository } from "../repositories/recommendationRepository.js";

export async function removeAll() {
  await recommendationRepository.removeAll();
}

export async function createMany() {
  await recommendationRepository.createMany();
}