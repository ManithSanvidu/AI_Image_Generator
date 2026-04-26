import type { GenerationQuotaSnapshot } from "@/lib/generation-quota";
import type { ImageGenerationModel } from "@/lib/image-models";

export type GenerationHistorySummaryItem = {
  id: string;
  clerkUserId: string;
  originalFileName: string | null;
  sourceImageUrl: string;
  resultImageUrl: string;
  styleSlug: string;
  styleLabel: string;
  model: string;
  promptUsed: string;
  createdAt: Date | string;
};

export type GenerationResult = {
  imageUrl: string;
  model: ImageGenerationModel;
  savedGeneration: GenerationHistorySummaryItem;
  style: {
    slug: string;
    label: string;
  };
  promptUsed: string;
};

export type StudioWorkbenchProps = {
  clerkUserId: string;
  initialHistory: GenerationHistorySummaryItem[];
  initialQuota: GenerationQuotaSnapshot;
};

export type UploadedSource = {
  imageUrl: string;
  originalFileName: string;
  sourceMimeType: string;
};
