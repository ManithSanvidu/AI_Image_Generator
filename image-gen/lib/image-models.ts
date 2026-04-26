export const imageModels = [
  "black-forest-labs/FLUX.1-schnell",
  "runwayml/stable-diffusion-v1-5",
] as const;

export type ImageGenerationModel = (typeof imageModels)[number];

export const imageModelLabels: Record<ImageGenerationModel, string> = {
  "black-forest-labs/FLUX.1-schnell": "FLUX.1 Schnell",
  "runwayml/stable-diffusion-v1-5": "Stable Diffusion v1.5",
};