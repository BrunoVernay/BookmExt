
function funBookmarks() {

      chrome.storage.local.get('BookMrk', actOnBmk);
}

function actOnBmk( bmk ) {
    var BkmArray = bmk.BookMrk;
    if (!BkmArray) {
        console.log("No data in LocalStorage!");
        return;
    }
    console.log('Bmk was: ' + JSON.stringify(BkmArray).length);
    var xhr = new XMLHttpRequest();
    for (var i = 0 ; i< BkmArray.length ; i++) {
        var url = BkmArray[i].url;
        if (url.startsWith('http://')) {
            // Won't work due to CSP. 
            // Will have to find a proxy/testing service Netcraft?
          xhr.open("GET", BkmArray[i].url, true);
          xhr.send();
          var result = xhr.status();
          console.log('Result: ' + JSON.stringify(xhr));
        }
    }
}


function saveBookmarks() {
  chrome.bookmarks.getTree(
    function(bookmarkTreeNodes) {
        var myBkm = [];

        saveTreeNodes(bookmarkTreeNodes, "", myBkm);

      // Save it using the Chrome extension storage API.
      chrome.storage.local.clear();
      console.log('Bmk : ' + JSON.stringify(myBkm).length);
      chrome.storage.local.set({'BookMrk': myBkm}, function() {
         console.log('Bkm saved');
      });
      chrome.storage.local.get(['BookMrk'], function(item){
        console.log('Bmk retrieved: ' + JSON.stringify(item).length);
      });
    });
}

function saveTreeNodes(bookmarkNodes, tags, myBkm) {
  for (var i = 0; i < bookmarkNodes.length; i++) {
    if (bookmarkNodes[i].url) {
        var tr = {};
        tr.id = bookmarkNodes[i].id;
        tr.title = bookmarkNodes[i].title;
        tr.date = new Date(bookmarkNodes[i].dateAdded).toISOString().split('.')[0].replace('T',' ');
        tr.tags = tags;
        tr.url = bookmarkNodes[i].url;
        myBkm.push(tr);
    } 
    else {
        var separ = tags ? ";" : "";
        saveTreeNodes(bookmarkNodes[i].children, tags + separ + bookmarkNodes[i].title, myBkm);
    }
  }
}


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
  $("#view_tree").click(function() {
    chrome.tabs.update( null, {"url": chrome.extension.getURL("tree.html")});
  });
  $("#view_d3tree").click(function() {
    chrome.tabs.update( null, {"url": chrome.extension.getURL("d3tree.html")});
  });
  $("#save_bkm").click(function() {
    saveBookmarks();
  });
  $("#act_bkm").click(function() {
    funBookmarks();
  });
  dumpBookmarks();
})

