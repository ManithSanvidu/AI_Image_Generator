import https from "https";

const req = https.request("https://api-inference.huggingface.co/models/some/invalid-model", {
  method: "POST",
}, (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => console.log("Response:", data));
});

req.on("error", console.error);
req.end();
