const apiUrl =
  "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5";
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
      inputs: "A beautiful landscape",
    }),
  });

  if (!response.ok) {
    console.error("Error:", await response.text());
    return;
  }

  console.log("Success");
}

run();
