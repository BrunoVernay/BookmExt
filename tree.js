
// Traverse the bookmark tree, and print the folder and nodes.
function dumpBookmarks() {
  var bookmarkTreeNodes = chrome.bookmarks.getTree(
    function(bookmarkTreeNodes) {
      $('#tree').empty();
      $('#tree').append(dumpTreeNodes(bookmarkTreeNodes, 0, getOptions()).ul);
    });
}

function dumpTreeNodes(bookmarkNodes, nbLinksCmul, options) {
  var list = $('<ul>');
  var nbLinks = 0;
  for (var i = 0; i < bookmarkNodes.length; i++) {
    if (bookmarkNodes[i].url)  nbLinks++;
    else {
        var elem = dumpNode(bookmarkNodes[i], options);
        nbLinksCmul = nbLinksCmul + elem.nbLinksCmul;
        list.append(elem.li);
    }
  }
  return {"ul":list, "nbLinks":nbLinks, "nbLinksCmul":nbLinksCmul};
}

function dumpNode(bookmarkNode, options) {
  var nbChildren = 0;
  var li;
  var obj;
  var nbLinks = 0;
  var nbLinksCmul = 0;
  if (bookmarkNode.children) {
      nbChildren = bookmarkNode.children.length;
  }
  if (nbChildren > 0) {
      obj = dumpTreeNodes(bookmarkNode.children, nbLinksCmul, options);
      nbLinks = obj.nbLinks;
      nbLinksCmul = obj.nbLinksCmul + nbLinks; 
  }
  var span = $('<span>');
  if (bookmarkNode.title) {
    if (bookmarkNode.url) {
    } else {
	    span.text(bookmarkNode.title + ": "+ nbLinks +" ; "+ nbLinksCmul );
        var scale = Math.log(nbLinksCmul)/Math.log(400);
        if (!options.flat) {
            span.css({ "font-weight": 100*Math.floor(10*scale),
                       "font-size": (1+scale*1.2)+"em" });
        };
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

function getOptions() {
    var options = {"flat": $('#flat').is(':checked')};
    return options;
}

function ready() {
  $("#flat").change(function() { dumpBookmarks()});
  dumpBookmarks();
}

document.addEventListener('DOMContentLoaded', function () {
    ready();
});

