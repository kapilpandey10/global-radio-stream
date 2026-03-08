

# Update: Display Station Thumbnail in Now Playing & Mini-Player

This is a small addition to the existing plan. Wherever a station is currently playing, its thumbnail/logo will be prominently displayed:

## Changes

1. **Mini-Player Bar** — Show the station's `favicon` (thumbnail) as a small circular image on the left side of the persistent bottom bar. Fall back to a Radio icon if no favicon is available.

2. **Now Playing Full-Screen View** — Display the station's `favicon` as a large, centered image (with a gradient backdrop and subtle pulse animation while playing). Fall back to a styled placeholder with the station's initials.

3. **Station Data** — The Radio Browser API already provides a `favicon` field for each station. This will be stored in the player context/state alongside the station name, country, and stream URL, so it's accessible everywhere.

4. **Image Handling** — Use an `onError` fallback so broken/missing thumbnails gracefully degrade to a default radio icon or station initials avatar.

This is already naturally part of the planned implementation — just confirming it will be included in the mini-player, now-playing view, search results, favorites list, and station detail sheet.

