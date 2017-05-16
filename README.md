# Simple Chrome Extension to list all bookmarks

Started from https://developer.chrome.com/extensions/bookmarks and simplified.

## Status

Multiple presentations are available:
- Table 
- Tree
- Graphical with d3.js (Not working yet)

Note: Tag are not really tags, just the cumulated folder's titles

Next step:
- Find a way to store more data
 - Since there is nowhere to store in the Google provided structure, we have to duplicate the info in the browser LocalStorage.
     - Already, there is not enough place to store the page's content. Only the HTTP status code is stored, with the date.
 - We will deal with the synchro later
 - Might be possible to use the `meta_info` in `~/.config/google-chrome/Default/Bookmarks`

## Dependencies

- https://developers.google.com/speed/libraries/#jquery


