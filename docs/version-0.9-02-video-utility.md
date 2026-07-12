# SVNS Stats Analyzer

# Version0.9 Video Utility Refactor

Version: v0.9-02  
Status: Implemented / Display check pending

## Purpose

YouTube URL parsing, video sorting, and availability logic were moved out of `VideoLibrary.jsx` into a shared utility.

## New file

```text
src/utils/videoUtils.js
```

Exports:

- `VIDEO_TYPE_PRIORITY`
- `getVideoAvailability`
- `sortVideos`
- `getYouTubeVideoId`
- `getYouTubeEmbedUrl`

## Updated file

```text
src/components/VideoLibrary.jsx
```

The component now imports common video functions from `videoUtils.js`.

## Expected behavior

There should be no visible or functional change in Video Library.

Check:

- Match list appears
- Availability badges appear
- Full match remains the preferred video
- Multiple videos can still be switched
- YouTube playback works
- External YouTube links work
- Japanese and English displays work
- Mobile layout remains unchanged

After confirming these items, v0.9-02 is complete.
