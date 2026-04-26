function getConfiguredApiKey() {
  return process.env.HUGGINGFACE_API_KEY?.trim() ?? "";
}

export function getHuggingFaceApiKey() {
  return getConfiguredApiKey();
}

export function getHuggingFaceHeaders(contentType = "application/json") {
  const huggingFaceApiKey = getConfiguredApiKey();
  if (!huggingFaceApiKey) {
    return null;
  }

  return {
    Authorization: `Bearer ${huggingFaceApiKey}`,
    "Content-Type": contentType,
  };
}
