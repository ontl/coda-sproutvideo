import * as coda from "@codahq/packs-sdk";

export const VideoSchema = coda.makeObjectSchema({
  type: coda.ValueType.Object,
  id: "videoId",
  primary: "title",
  featured: ["thumbnail", "duration", "createdAt"],
  properties: {
    videoId: {
      type: coda.ValueType.String,
      fromKey: "id",
    },
    title: { type: coda.ValueType.String },
    createdAt: {
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.DateTime,
      fromKey: "created_at",
    },
    updatedAt: {
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.DateTime,
      fromKey: "updated_at",
    },
    height: { type: coda.ValueType.Number },
    width: { type: coda.ValueType.Number },
    description: { type: coda.ValueType.String },
    plays: { type: coda.ValueType.Number },
    sourceSizeMB: {
      type: coda.ValueType.Number,
      fromKey: "source_video_file_size",
    },
    // embedCode: {
    //   type: coda.ValueType.String,
    //   fromKey: "embed_code",
    // },
    // state: { type: coda.ValueType.String },
    tags: {
      type: coda.ValueType.Array,
      description: "Tags",
      items: coda.makeSchema({
        type: coda.ValueType.String,
      }),
    },
    duration: {
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.Duration,
    },
    password: { type: coda.ValueType.String },
    privacy: { type: coda.ValueType.String },
    posterFrame: {
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.ImageAttachment,
    },
    thumbnail: {
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.ImageAttachment,
    },
    bestResolution: { type: coda.ValueType.String },
    aspectRatio: { type: coda.ValueType.String },
    // TODO: get the folder name from the lsit of folders
    folder: { type: coda.ValueType.String },
  },
});

// API response for Videos:
// "created_at": "2010-08-26T21:35:41-04:00",
// "updated_at": "2012-12-20T00:07:54-05:00",
// "height": 540,
// "width": 960,
// "description": "An example movie",
// "id": "a098d2bbd33e1c328",
// "plays": 348,
// "title": "example.mov",
// "source_video_file_size": 0,
// "embed_code": "<iframe class='sproutvideo-player' type='text/html' src='https://videos.sproutvideo.com/embed/a098d2bbd33e1c328/7ca00d6d622a8e8d' width='630' height='354' frameborder='0'></iframe>",
// "state": "deployed",
// "security_token": "7ca00d6d622a8e8d",
// "progress": 100,
// "tags": [
//   "4a32d29b4c4"
// ],
// "embedded_url": null,
// "duration": 73,
// "password": null,
// "privacy": 0,
// "requires_signed_embeds": false,
// "selected_poster_frame_number": 0,
// "assets": {
//   "videos": {
//     "240p": "https://api-files.sproutvideo.com/file/a098d2bbd33e1c328/7ca00d6d622a8e8d/240.mp4",
//     "360p": "https://api-files.sproutvideo.com/file/a098d2bbd33e1c328/7ca00d6d622a8e8d/360.mp4",
//     "480p": "https://api-files.sproutvideo.com/file/a098d2bbd33e1c328/7ca00d6d622a8e8d/480.mp4",
//     "720p": "https://api-files.sproutvideo.com/file/a098d2bbd33e1c328/7ca00d6d622a8e8d/720.mp4",
//     "1080p": "https://api-files.sproutvideo.com/file/a098d2bbd33e1c328/7ca00d6d622a8e8d/1080.mp4",
//     "2k": null,
//     "4k": null,
//     "8k": null,
//     "source": null
//   },
//   "thumbnails": [
//     "https://images.sproutvideo.com/3d5944db5f967420e4ab256c39b5/d2746e08d99b1da272bc4f553d/thumbnails/frame_0000.jpg",
//     "https://images.sproutvideo.com/3d5944db5f967420e4ab256c39b5/d2746e08d99b1da272bc4f553d/thumbnails/frame_0001.jpg",
//     "https://images.sproutvideo.com/3d5944db5f967420e4ab256c39b5/d2746e08d99b1da272bc4f553d/thumbnails/frame_0002.jpg",
//     "https://images.sproutvideo.com/3d5944db5f967420e4ab256c39b5/d2746e08d99b1da272bc4f553d/thumbnails/frame_0003.jpg",
//     "https://images.sproutvideo.com/3d5944db5f967420e4ab256c39b5/d2746e08d99b1da272bc4f553d/thumbnails/frame_0004.jpg",
//     "https://images.sproutvideo.com/3d5944db5f967420e4ab256c39b5/d2746e08d99b1da272bc4f553d/thumbnails/frame_0005.jpg"
//   ],
//   "poster_frames": [
//     "https://images.sproutvideo.com/3d5944db5f967420e4ab256c39b5/d2746e08d99b1da272bc4f553d/poster_frames/frame_0000.jpg",
//     "https://images.sproutvideo.com/3d5944db5f967420e4ab256c39b5/d2746e08d99b1da272bc4f553d/poster_frames/frame_0001.jpg",
//     "https://images.sproutvideo.com/3d5944db5f967420e4ab256c39b5/d2746e08d99b1da272bc4f553d/poster_frames/frame_0002.jpg",
//     "https://images.sproutvideo.com/3d5944db5f967420e4ab256c39b5/d2746e08d99b1da272bc4f553d/poster_frames/frame_0003.jpg"
//   ]
// },
// "download_sd": null,
// "download_hd": null,
// "download_source": null,
// "allowed_domains": null,
// "allowed_ips": null,
// "player_social_sharing": null,
// "player_embed_sharing": null,
// "require_email": false,
// "require_name": false,
// "hide_on_site": false,
// "folder_id": null
// },
