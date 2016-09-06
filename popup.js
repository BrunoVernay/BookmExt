
// Traverse the bookmark tree, and print the folder and nodes.
function dumpBookmarks() {
  var bookmarkTreeNodes = chrome.bookmarks.getTree(
    function(bookmarkTreeNodes) {
      $('#bookmarks').append(dumpTreeNodes(bookmarkTreeNodes));
    });
}
function dumpTreeNodes(bookmarkNodes) {
  var list = $('<ul>');
  var i;
  for (i = 0; i < bookmarkNodes.length; i++) {
    list.append(dumpNode(bookmarkNodes[i]));
  }
  return list;
}
function dumpNode(bookmarkNode) {
  if (bookmarkNode.title) {
    var span = $('<span>');
    if (bookmarkNode.url) {
	    var anchor = $('<a>');
	    anchor.attr('href', bookmarkNode.url);
	    anchor.text(bookmarkNode.title);
	    /*
	     * When clicking on a bookmark in the extension, a new tab is fired with
	     * the bookmark url.
	     */
	    anchor.click(function() {
		    chrome.tabs.create({url: bookmarkNode.url});
	    });
	    span.append(anchor);
    } else {
	    span.text(bookmarkNode.title);
    }
  }
  var li = $(bookmarkNode.title ? '<li>' : '<div>').append(span);
  if (bookmarkNode.children && bookmarkNode.children.length > 0) {
    li.append(dumpTreeNodes(bookmarkNode.children));
  }
  return li;
}

chrome.tabs.create({ url:chrome.extension.getURL('tree.html')  } );

document.addEventListener('DOMContentLoaded', function () {
  dumpBookmarks();
});

