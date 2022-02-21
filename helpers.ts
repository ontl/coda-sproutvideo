import * as coda from "@codahq/packs-sdk";
import { METHODS } from "http";

const BASE_URL = "https://api.sproutvideo.com/v1/";
const PRIVACY_STATES = [
  "Private",
  "Password Protected",
  "Public",
  "Login Protected",
];

export async function callApi(
  context: coda.ExecutionContext,
  endpoint: "videos" | "folders" | "tags" | "account",
  method: "GET" | "POST" = "GET",
  ttl: number = 3600,
  params?: { [key: string]: string }
) {
  let response = await context.fetcher.fetch({
    method: method,
    url: BASE_URL + endpoint,
    cacheTtlSecs: ttl,
  });
  return response.body;
}

function findBestResolution(resolutions: { [key: string]: string }): string {
  let bestResolution: string;
  if (resolutions["240p"]) bestResolution = "240p";
  if (resolutions["360p"]) bestResolution = "360p";
  if (resolutions["480p"]) bestResolution = "480p";
  if (resolutions["720p"]) bestResolution = "720p";
  if (resolutions["1080p"]) bestResolution = "1080p";
  if (resolutions["2k"]) bestResolution = "2k";
  if (resolutions["4k"]) bestResolution = "4k";
  if (resolutions["8k"]) bestResolution = "8k";
  if (resolutions["source"]) bestResolution = "source";
  return bestResolution;
}

/**
 * Calculates the closest common aspect ratio
 */
function calculateAspectRatio(width: number, height: number): string {
  if (width === 0 || height === 0) return "";
  let trueRatio = width / height;
  if (trueRatio === 1) return "1:1 (square)";
  if (trueRatio > 2.3 && trueRatio < 2.5) return "2.39:1 (Cinemascope)";
  if (trueRatio > 1.95 && trueRatio < 2.05) return "2:1";
  if (trueRatio > 1.878 && trueRatio < 1.95) return "1.9:1 (DCI)";
  if (trueRatio > 1.678 && trueRatio < 1.878) return "16:9 (widescreen)";
  if (trueRatio > 1.233 && trueRatio < 1.433) return "4:3 (traditional)";
  if (trueRatio > 1.4 && trueRatio < 1.6) return "3:2 (wide)";
  if (trueRatio > 0.75 && trueRatio < 0.85) return "5:4 (social tall)";
  if (trueRatio > 0.5125 && trueRatio < 0.6125) return "9:16 (vertical)";
  if (width > height) {
    return "horizontal";
  } else {
    return "vertical";
  }
}

export async function syncVideos(context: coda.SyncExecutionContext) {
  let [videosResponse, tagsResponse] = await Promise.all([
    callApi(context, "videos", "GET", 0),
    callApi(context, "tags", "GET", 60 * 60),
  ]);

  let videos = videosResponse.videos;
  let allTags = tagsResponse.tags;

  for (let video of videos) {
    // Replace the privacy integer (0-3) with its string representation
    video.privacy = PRIVACY_STATES[video.privacy];
    video.thumbnail = video.assets.thumbnails[0];
    video.posterFrame =
      video.assets.poster_frames[video.selected_poster_frame_number];
    video.bestResolution = findBestResolution(video.assets.videos);
    video.aspectRatio = calculateAspectRatio(video.width, video.height);
    // Coda needs a string for a duration property, with units mentioned
    video.duration = Math.round(video.duration) + " secs";
    // Take the tag IDs that we get, and match them to their corresponding tag labels
    video.tags = video.tags.map(
      (tagId) => allTags.find((tag) => tag.id === tagId).name
    );
    // Convert video file size to MB
    video.source_video_file_size = Math.round(
      video.source_video_file_size / 1024 / 1024
    );
  }

  return {
    result: videos,
    continuation: undefined,
  };
}
