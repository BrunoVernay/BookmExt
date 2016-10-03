//
// Traverse the bookmark tree and fill my structures

// 
function getBookm(bookmarkNodes) {
  var mb ;

  for (var i = 0; i < bookmarkNodes.length; i++) {
      if (bookmarkNodes[i].url) {
          nbLinks++;
          // TODO add the link to the list
      } else {
             var elem = 0;//dumpNode(bookmarkNodes[i]);
//             nbLinksCmul = nbLinksCmul + elem.nbLinksCmul;
  //           list.append(elem.li);
      }
  }
//    return {"ul":list, "nbLinks":nbLinks, "nbLinksCmul":nbLinksCmul};

}

// All work is done in this call back
function workOnBookm(bookmarkNodes) {
  var myBookm = getBookm(bookmarkNodes); 

  console.log("Me: "+ myBookm);
}

// Entry point
function entryPoint() {
  var me = this;
  chrome.bookmarks.getTree(workOnBookm);
}


//////////////////////////////////////////////////////////


// Traverse the bookmark tree, and print the folder and nodes.
function dumpBookmarks() {
    // Could not ffind how to search for ALL bookmarks and folders
    var btn = chrome.bookmarks.search( {"query":"t"}, function (bookmarkTreeNodes) {
        console.log("Nb. bookmarks = " + bookmarkTreeNodes.length);
            } );

  chrome.bookmarks.getTree(
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

document.addEventListener('DOMContentLoaded', function () {
  entryPoint();
  $("#view_button").click(function() {
    chrome.tabs.update( null, {"url": chrome.extension.getURL("table.html")});
  });
  $("#flat").change(function() { dumpBookmarks()});
  dumpBookmarks();
});

