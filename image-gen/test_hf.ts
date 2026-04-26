import * as dotenv from "dotenv";
dotenv.config();

async function run() {
  const url =
    "https://api-inference.huggingface.co/models/stable-diffusion-v1-5/stable-diffusion-v1-5";
  const headers = {
    Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
    "Content-Type": "application/json",
  };
  
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      inputs:
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a1Z0AAAAASUVORK5CYII=",
      parameters: {
        prompt: "A fantasy portrait of a warrior",
      },
    }),
  });
  
  const text = await response.text();
  console.log("Status:", response.status);
  console.log("Response:", text);
}

run();
