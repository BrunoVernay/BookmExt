
// Traverse the bookmark tree, and print the folder and nodes.
function dumpBookmarks() {
  var bookmarkTreeNodes = chrome.bookmarks.getTree(
    function(bookmarkTreeNodes) {
      $('#tree').append(dumpTreeNodes(bookmarkTreeNodes).ul, 0);
    });
}

function dumpTreeNodes(bookmarkNodes, nbLinksCmul) {
  var list = $('<ul>');
  var nbLinks = 0;
  for (var i = 0; i < bookmarkNodes.length; i++) {
    if (bookmarkNodes[i].url)  nbLinks++;
    else {
        var elem = dumpNode(bookmarkNodes[i]);
        nbLinksCmul = nbLinksCmul + elem.nbLinksCmul;
        list.append(elem.li);
    }
  }
  return {"ul":list, "nbLinks":nbLinks, "nbLinksCmul":nbLinksCmul};
}

function dumpNode(bookmarkNode) {
  var nbChildren = 0;
  var li;
  var obj;
  var nbLinks = 0;
  var nbLinksCmul = 0;
  if (bookmarkNode.children) {
      nbChildren = bookmarkNode.children.length;
  }
  if (nbChildren > 0) {
      obj = dumpTreeNodes(bookmarkNode.children, nbLinksCmul);
      nbLinks = obj.nbLinks;
      nbLinksCmul = obj.nbLinksCmul + nbLinks; 
  }
  var span = $('<span>');
  if (bookmarkNode.title) {
    if (bookmarkNode.url) {
    } else {
	    span.text(bookmarkNode.title + ": "+ nbLinks +" ; "+ nbLinksCmul );
        span.css("font-size", (0.3+Math.log(nbLinksCmul)/2)+"em");
        span.css("font-weight", (900*Math.log(nbLinksCmul)/Math.log(330))+"");
        li = $('<li>').append(span);
    }
  } else {
      li = $('<div>').append(span);
  }

  if (obj) {
    li.append(obj.ul);
  }
  return {"li":li, "nbLinksCmul":nbLinksCmul};
}

document.addEventListener('DOMContentLoaded', function () {
  dumpBookmarks();
});

