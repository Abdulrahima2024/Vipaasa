import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const awsRegion = process.env.AWS_REGION || "ap-south-1";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucketName = process.env.S3_BUCKET_PRODUCTS || "vipaasa-product-images";
const cloudFrontUrl = process.env.CLOUDFRONT_URL || "";

// Initialize S3 Client only if credentials exist
let s3Client: S3Client | null = null;
const isConfigured = !!(accessKeyId && secretAccessKey);

if (isConfigured) {
  s3Client = new S3Client({
    region: awsRegion,
    credentials: {
      accessKeyId: accessKeyId!,
      secretAccessKey: secretAccessKey!,
    },
  });
} else {
  console.warn("⚠️ AWS S3 is not fully configured. Using mock simulated storage for uploads.");
}

/**
 * Uploads a file buffer to S3 and returns its delivery URL.
 * Falls back to base64 or simulated local URLs if S3 is unconfigured.
 */
export async function uploadToS3(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const extension = mimeType.split("/")[1] || "jpg";
  const uniqueKey = `avatars/${fileName}-${Date.now()}.${extension}`;

  if (isConfigured && s3Client) {
    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: uniqueKey,
          Body: fileBuffer,
          ContentType: mimeType,
          // Cache-Control header for CloudFront CDN optimization (cache for 1 year)
          CacheControl: "public, max-age=31536000, immutable",
        })
      );

      // Construct delivery URL. Strip trailing slash on CloudFront domain
      const baseUrl = cloudFrontUrl.replace(/\/$/, "");
      return baseUrl ? `${baseUrl}/${uniqueKey}` : `https://${bucketName}.s3.${awsRegion}.amazonaws.com/${uniqueKey}`;
    } catch (error) {
      console.error("❌ Failed S3 upload, falling back to simulated storage:", error);
      // Proceed to mock fallback
    }
  }

  // Simulated / mock storage for local testing when AWS credentials are not set
  // Converts to base64 so user gets actual image persistency instantly
  const base64Data = fileBuffer.toString("base64");
  return `data:${mimeType};base64,${base64Data}`;
}
