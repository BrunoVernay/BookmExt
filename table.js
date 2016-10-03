

// Traverse the bookmark tree, and print the folder and nodes.
function dumpBookmarks() {

  chrome.bookmarks.getTree(
    function(bookmarkTreeNodes) {
      $('#table').empty();
      $('#table').append($('<tr>')
              .append($('<th>').text("Id"))
              .append($('<th>').text("Title"))
              .append($('<th>').text("Date"))
              .append($('<th>').text("Tags"))
              .append($('<th>').text("URL"))
              );
      dumpTreeNodes(bookmarkTreeNodes, "", getOptions());
    });
}

function dumpTreeNodes(bookmarkNodes, tags, options) {
  for (var i = 0; i < bookmarkNodes.length; i++) {
    if (bookmarkNodes[i].url) {
        var tr = $('<tr>');
        tr.append($('<td>').text(bookmarkNodes[i].id));
        tr.append($('<td>').text(bookmarkNodes[i].title));
        tr.append($('<td>').text(new Date(bookmarkNodes[i].dateAdded).toISOString().split('.')[0].replace('T',' ')));
        tr.append($('<td>').text(tags));
        tr.append($('<td>').text(bookmarkNodes[i].url));
        $('#table').append(tr);
    } 
    else {
        var separ = tags ? ";" : "";
        dumpTreeNodes(bookmarkNodes[i].children, tags + separ + bookmarkNodes[i].title, options);
    }
  }
}


function getOptions() {
    var options = {"flat": $('#flat').is(':checked')};
    return options;
}

document.addEventListener('DOMContentLoaded', function () {
  $("#view_button").click(function() {
    chrome.tabs.update( null, {"url": chrome.extension.getURL("tree.html")});
  });
  dumpBookmarks();
});

