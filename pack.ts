import * as coda from "@codahq/packs-sdk";
import * as helpers from "./helpers";
import * as schemas from "./schemas";

export const pack = coda.newPack();

pack.setUserAuthentication({
  type: coda.AuthenticationType.CustomHeaderToken,
  headerName: "SproutVideo-Api-Key",
  instructionsUrl: "https://sproutvideo.com/settings/api",
  getConnectionName: async function (context) {
    let response = await helpers.callAPI(
      context,
      "account",
      "GET",
      60 * 60 * 24
    );
    return `${response.company} (${response.first_name} ${response.last_name})`;
  },
});

pack.addNetworkDomain("sproutvideo.com");

pack.addSyncTable({
  name: "Videos",
  identityName: "Video",
  schema: schemas.VideoSchema,
  formula: {
    name: "SyncVideos",
    description: "Syncs videos from your Sprout Video library",
    parameters: [
      coda.makeParameter({
        name: "StartFrom",
        description:
          "Useful in cases where you have >10,000 videos, so not all old videos sync. Entering '3000' here will start from the 3000th-most-recent video and go back in time from there.",
        type: coda.ParameterType.Number,
        optional: true,
      }),
    ],
    execute: async function ([startFrom], context) {
      return helpers.syncVideos(context, startFrom);
    },
  },
});

pack.addFormula({
  name: "Tag",
  description: "Tags a video",
  parameters: [
    coda.makeParameter({
      name: "VideoID",
      description: "The ID of the video",
      type: coda.ParameterType.String,
    }),
    coda.makeParameter({
      name: "Tag",
      description: "The tag to add",
      type: coda.ParameterType.String,
    }),
  ],
  resultType: coda.ValueType.Object,
  schema: schemas.VideoSchema,
  isAction: true,
  execute: async function ([videoID, tag], context) {
    return helpers.addTag(context, videoID, tag);
  },
});
