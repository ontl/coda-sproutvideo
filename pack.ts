import * as coda from "@codahq/packs-sdk";
import * as helpers from "./helpers";
import * as schemas from "./schemas";

export const pack = coda.newPack();

pack.setUserAuthentication({
  type: coda.AuthenticationType.CustomHeaderToken,
  headerName: "SproutVideo-Api-Key",
  instructionsUrl: "https://sproutvideo.com/settings/api",
  getConnectionName: async function (context) {
    let response = await helpers.callApi(
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
    parameters: [],
    execute: async function ([], context) {
      return helpers.syncVideos(context);
    },
  },
});
