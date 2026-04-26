const apiUrl =
  "https://api-inference.huggingface.co/models/stable-diffusion-v1-5/stable-diffusion-v1-5";
const apiKey = process.env.HUGGINGFACE_API_KEY;

async function run() {
  if (!apiKey) {
    throw new Error("Missing HUGGINGFACE_API_KEY.");
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs:
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a1Z0AAAAASUVORK5CYII=",
      parameters: {
        prompt: "A cinematic portrait with soft studio lighting.",
        width: 768,
        height: 768,
      },
    }),
  });

  console.log("status", response.status);
}

void run();
