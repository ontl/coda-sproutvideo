import * as coda from "@codahq/packs-sdk";
import * as types from "./types";

const BASE_URL = "https://api.sproutvideo.com/v1/";
const PRIVACY_STATES = [
  "Private",
  "Password Protected",
  "Public",
  "Login Protected",
];

/**
 * Main API access function. Note: returns response.body, not response
 */
export async function callAPI(
  context: coda.ExecutionContext,
  endpoint: string,
  method: "GET" | "PUT" | "POST" = "GET",
  ttl: number = 3600,
  params?: { [key: string]: string | string[] }
) {
  let url = BASE_URL + endpoint;
  // If this is a GET request, add the params to the endpoint
  if (method === "GET") {
    url = coda.withQueryParams(url, params);
    let response = await context.fetcher.fetch({
      method: "GET",
      url: url,
      cacheTtlSecs: ttl,
    });
    return response.body;
  } else {
    // If this is a POST or PUT request, put the params into the body as JSON. Note that
    // Coda does not cache POST or PUT requests, so we don't need to set a cacheTtlSecs
    let response = await context.fetcher.fetch({
      method: method,
      url: url,
      body: JSON.stringify(params),
    });
    return response.body;
  }
}

/**
 * Returns the best resolution that a video is available in
 */
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

/**
 * Takes a video object as returned by the Sprout API, and massages it into
 * the Coda-ready schema.
 */
function enrichVideo(video, allTags: types.Tag[]) {
  // Replace the privacy integer (0-3) with its string representation
  video.privacy = PRIVACY_STATES[video.privacy];
  video.thumbnail = video.assets.thumbnails[0];
  video.posterFrame =
    video.assets.poster_frames[video.selected_poster_frame_number];
  video.bestResolution = findBestResolution(video.assets.videos);
  video.aspectRatio = calculateAspectRatio(video.width, video.height);
  video.link = "https://sproutvideo.com/videos/" + video.id;
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
  return video;
}

/**
 *  Sync table function for Videos
 */
export async function syncVideos(context: coda.SyncExecutionContext) {
  // If there's an existing continuation, use its endpoint URL with page
  // number etc. included. Otherwise, just use the basic "videos" endpoint.
  let endpoint =
    (context.sync.continuation?.nextPageEndpoint as string) || "videos";

  let [videosResponse, tagsResponse] = await Promise.all([
    // Get the videos
    callAPI(context, endpoint, "GET", 0, {
      order_by: "created_at",
      order_dir: "desc",
    }),
    // Get the tags
    callAPI(context, "tags", "GET", 60 * 60),
  ]);

  let videos = videosResponse.videos;
  let allTags = tagsResponse.tags;

  let enrichedVideos = videos.map((video) => enrichVideo(video, allTags));

  let nextContinuation;
  if (videosResponse.next_page)
    nextContinuation = {
      // Get the URL for the next page. Strip out the BASE_URL, cause we'll be
      // adding that back in ourselves in callApi().
      nextPageEndpoint: videosResponse.next_page.replace(BASE_URL, ""),
    };

  return {
    result: enrichedVideos,
    continuation: nextContinuation,
  };
}

/**
 * Action formula for tagging a video
 */
export async function addTag(
  context: coda.ExecutionContext,
  videoId: string,
  tagName: string
) {
  // First, get the video (to see what tags are already one it), and also the list of
  // existing tags for the account overall.
  let [video, tagsResponse] = await Promise.all([
    callAPI(context, `videos/${videoId}`, "GET"),
    callAPI(context, "tags", "GET"),
  ]);
  let accountTags = tagsResponse.tags;

  if (!video) throw new coda.UserVisibleError("Video not found");

  // Let's see if the tag exists in the system already
  let tagRecord: types.Tag = accountTags.find(
    (tag) => tag.name.toLowerCase() === tagName.toLowerCase()
  );
  // If not, create it
  if (!tagRecord)
    tagRecord = await callAPI(context, "tags", "POST", 0, {
      name: tagName,
    });

  // If the tag is already applied to the video, just return the video. We could consider throwing
  // an error here, but there may be situations where users are applying tags to a batch of
  // videos, and it's best to just stay quiet if some of them already had this tag I think.
  if (video.tags.includes(tagRecord.id)) return enrichVideo(video, accountTags);

  // Get the existing tags for this video, and add the new one if it's not already there
  let videoTags: string[] = video.tags;
  videoTags.push(tagRecord.id);

  // Update the video record on Sprout
  let newVideoResponse = await callAPI(context, `videos/${videoId}`, "PUT", 0, {
    tags: videoTags,
  });

  return enrichVideo(newVideoResponse, accountTags);
}
