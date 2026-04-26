import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

async function run() {
  try {
    console.log("Starting...");
    // Mock 1x1 png image
    const base64Img = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a1Z0AAAAASUVORK5CYII=";
    const buffer = Buffer.from(base64Img, "base64");
    
    // Convert buffer to a native Blob
    const blob = new Blob([buffer], { type: "image/png" });

    const result = await hf.imageToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: blob,
      parameters: {
        prompt: "A beautiful landscape",
      }
    });
    
    console.log("Success! Result object:", result);
  } catch (error) {
    console.error("Failed:", error);
  }
}

run();
