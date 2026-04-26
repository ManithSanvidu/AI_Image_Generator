import { getHuggingFaceApiKey } from "./lib/huggingface";
import type { ImageGenerationModel } from "./lib/image-models";
import * as dotenv from "dotenv";

dotenv.config();

const model: ImageGenerationModel = "stable-diffusion-v1-5/stable-diffusion-v1-5";

console.log("Model:", model);
console.log("API key configured:", Boolean(getHuggingFaceApiKey()));
