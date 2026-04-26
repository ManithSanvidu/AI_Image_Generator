import {
  countGenerationsSince,
  createGeneration,
  utxMonthStart,
} from "@/db/generations";
import { ACCEPTED_SOURCE_IMAGE_MIME_TYPES } from "@/lib/constants";
import { getMonthlyGenerationLimit } from "@/lib/generation-quota";
import { uploadBufferToImageKit } from "@/lib/imagekit";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { imageModels, type ImageGenerationModel } from "@/lib/image-models";
import { getHuggingFaceHeaders } from "@/lib/huggingface";
import { getStylePreset } from "@/lib/style-presets";
import sharp from "sharp";

export const runtime = "nodejs";

const GENERATION_AGENT_NAME = "image_stylizer";

type EditImageAspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

type GenerateImageRequest = {
  sourceImageUrl?: string;
  sourceMimeType?: string;
  originalFileName?: string;
  styleSlug?: string;
  model?: string;
};

type RetryErrorLike = {
  name: "RetryError";
  lastError: unknown;
};

type HuggingFaceErrorResponse = {
  error?: string;
  estimated_time?: number;
};

function isImageGenerationModel(model: string): model is ImageGenerationModel {
  return imageModels.includes(model as ImageGenerationModel);
}

function isRetryError(error: unknown): error is RetryErrorLike {
  if (!error || typeof error !== "object") return false;

  const err = error as Record<string, unknown>;
  return err.name === "RetryError" && "lastError" in err;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;

  if (error && typeof error === "object") {
    const err = error as Record<string, unknown>;
    if (typeof err.message === "string") return err.message;
  }

  return String(error);
}

function getGeneratedFileName(
  originalFileName: string | undefined,
  styleSlug: string,
  mediaType: string,
) {
  const extension = mediaType.split("/")[1] ?? "png";
  const baseName =
    originalFileName?.replace(/\.[^.]+$/, "") || "generation";

  return `${baseName}-${styleSlug}-${Date.now()}.${extension}`;
}

/* ✅ FIXED FUNCTION (THIS WAS CAUSING YOUR ERROR) */
async function inferImageAspectRatio(
  imageBuffer: Buffer
): Promise<EditImageAspectRatio> {
  try {
    const metadata = await sharp(imageBuffer).metadata();

    if (!metadata.width || !metadata.height) return "1:1";

    const aspectRatio = metadata.width / metadata.height;

    const ratios: Array<{ label: EditImageAspectRatio; value: number }> = [
      { label: "1:1", value: 1 },
      { label: "3:4", value: 3 / 4 },
      { label: "4:3", value: 4 / 3 },
      { label: "9:16", value: 9 / 16 },
      { label: "16:9", value: 16 / 9 },
    ];

    const closest = ratios.reduce((prev, curr) => {
      return Math.abs(curr.value - aspectRatio) <
        Math.abs(prev.value - aspectRatio)
        ? curr
        : prev;
    });

    return closest.label;
  } catch {
    return "1:1";
  }
}

function getHuggingFaceApiUrl(model: ImageGenerationModel) {
  return `https://api-inference.huggingface.co/models/${model}`;
}

export async function POST(request: Request) {
  const { userId, has } = { userId: "user_test", has: () => false };

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const monthlyLimit = getMonthlyGenerationLimit(has);
  const usedThisMonth = await countGenerationsSince(
    userId,
    utxMonthStart()
  );

  if (usedThisMonth >= monthlyLimit) {
    return NextResponse.json(
      {
        error: `Monthly generation limit reached (${monthlyLimit}).`,
        code: "QUOTA_EXCEEDED",
      },
      { status: 429 }
    );
  }

  const headers = getHuggingFaceHeaders();
  if (!headers) {
    return NextResponse.json(
      { error: "Missing HUGGINGFACE_API_KEY." },
      { status: 500 }
    );
  }

  const body = (await request.json()) as GenerateImageRequest;
  const { model, originalFileName, sourceImageUrl, sourceMimeType, styleSlug } =
    body;

  if (!sourceImageUrl) {
    return NextResponse.json(
      { error: "Please upload an image first." },
      { status: 400 }
    );
  }

  if (
    typeof sourceMimeType !== "string" ||
    !ACCEPTED_SOURCE_IMAGE_MIME_TYPES.has(sourceMimeType)
  ) {
    return NextResponse.json(
      { error: "Only JPG, PNG, and WEBP files are supported." },
      { status: 400 }
    );
  }

  if (typeof styleSlug !== "string") {
    return NextResponse.json(
      { error: "Please choose a style." },
      { status: 400 }
    );
  }

  if (!model || !isImageGenerationModel(model)) {
    return NextResponse.json(
      { error: "Invalid or unsupported model." },
      { status: 400 }
    );
  }

  const selectedModel: ImageGenerationModel = model;

  const preset = getStylePreset(styleSlug);
  if (!preset) {
    return NextResponse.json(
      { error: "Unknown style preset." },
      { status: 400 }
    );
  }

  const imageResponse = await fetch(sourceImageUrl);
  if (!imageResponse.ok) {
    return NextResponse.json(
      { error: "Could not fetch source image." },
      { status: 404 }
    );
  }

  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
  const aspectRatio = await inferImageAspectRatio(imageBuffer);

  const prompt = preset.prompt;
  const negativePrompt =
    "No extra limbs, duplicate subjects, or distorted faces.";

  const size =
    aspectRatio === "16:9"
      ? { width: 1024, height: 576 }
      : aspectRatio === "9:16"
      ? { width: 576, height: 1024 }
      : { width: 768, height: 768 };

  const payload = {
    inputs: prompt,
    parameters: {
      negative_prompt: negativePrompt,
      guidance_scale: 7.5,
      num_inference_steps: 4,
      width: size.width,
      height: size.height,
    },
  };

  try {
    const response = await Sentry.startSpan(
      {
        name: `ai.agent.${GENERATION_AGENT_NAME}`,
        op: "ai.workflow",
      },
      async () =>
        fetch(getHuggingFaceApiUrl(selectedModel), {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        })
    );

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: text || "Generation failed" },
        { status: response.status }
      );
    }

    const mime = response.headers.get("content-type") || "image/png";
    const buffer = Buffer.from(await response.arrayBuffer());

    const uploaded = await uploadBufferToImageKit({
      buffer,
      fileName: getGeneratedFileName(
        originalFileName,
        preset.slug,
        mime
      ),
      folder: `/users/${userId}/results`,
      mimeType: mime,
    });

    const saved = await createGeneration({
      clerkUserId: userId,
      originalFileName: originalFileName ?? null,
      sourceImageUrl,
      resultImageUrl: uploaded.url,
      styleSlug: preset.slug,
      styleLabel: preset.label,
      model: selectedModel,
      promptUsed: prompt,
    });

    return NextResponse.json({
      imageUrl: uploaded.url,
      model: selectedModel,
      savedGeneration: saved,
      style: preset,
      promptUsed: prompt,
    });
  } catch (e: unknown) {
    console.error(e);
    Sentry.captureException(e);

    const errorMessage = getErrorMessage(e);

    return NextResponse.json(
      {
        error: "Image generation failed. " + errorMessage,
      },
      { status: 500 }
    );
  }
}