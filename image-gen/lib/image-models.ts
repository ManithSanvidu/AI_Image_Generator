export const imageModels = ["black-forest-labs/FLUX.1-schnell"] as const;

export type ImageGenerationModel = (typeof imageModels)[number];

export const imageModelLabels: Record<ImageGenerationModel, string> = {
  "black-forest-labs/FLUX.1-schnell": "FLUX.1 Schnell",
};
