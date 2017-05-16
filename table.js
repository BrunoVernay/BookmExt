
// To put in extension Option
var TAG_EXCLUDE='Schni';
var PREFIX_TESTED='T-';
var PREFIX_STORED='B-';


// Filters

function isTested(item) {
    return item.startsWith(PREFIX_TESTED);
}
function isStored(item) {
    return item.startsWith(PREFIX_STORED);
}


function funBookmarks() {

      chrome.storage.local.get( null, actOnBmk);
}

/*
 * Test the URL and store the HTML status code
 * (The bookmarks must have been stored)
 */
function actOnBmk( bmk ) {
    var keys = Object.keys(bmk).filter(isStored);
    var nbBookmarks = keys.length;
    console.info("Retrieved "+ nbBookmarks + " bookmarks" );
    if (nbBookmarks < 2) {
        console.warn("No data in LocalStorage!");
        return;
    }
    Object.values(bmk).forEach( function (bm) {
        if (bm.tags.includes(TAG_EXCLUDE)) return;
        var url = bm.url;
        console.log("Try request with url: " + url);
        if (url.startsWith('http://') || url.startsWith('https://')) {
          var xhr = new XMLHttpRequest();
          xhr.open("GET", url, true);
          xhr.onreadystatechange = function() {
             if (xhr.readyState == 2) {
                 if ( (400 < xhr.status) && (xhr.status < 520) ) {
                     console.warn('Status ', xhr.status, " for URL: ", url, "  Aborting!");
                     xhr.abort();
                 }
             }
             if (xhr.readyState == 4) {
                 console.log('Status ', xhr.status, " for URL: ", url,' ; Result: ' + xhr.responseText.length);
                 var result = {};
                 result.id = bm.id;
                 result.date = Date.now();
                 result.status = xhr.status;
                 result.text = xhr.responseText.length; // Quota exceeded
                 var o = {};
                 o['T-' + bm.id] = result;
                 chrome.storage.local.set( o , function() {
                   console.log("Saving " + JSON.stringify(o) ); });
              }
          }
          xhr.send();
        }
    });
}

/*
 * Save in LocalStorage
 */
function saveBookmarks() {
  chrome.bookmarks.getTree(
    function(bookmarkTreeNodes) {

      chrome.storage.local.clear();
      saveTreeNodes(bookmarkTreeNodes, "");

      chrome.storage.local.get(null , function(item){
        console.info('Bkm retrieved: ' + Object.keys(item).length);
      });
    });
}

function saveTreeNodes(bookmarkNodes, tags) {
  for (var i = 0; i < bookmarkNodes.length; i++) {
    if (bookmarkNodes[i].url) {
        var tr = {};
        tr.id = bookmarkNodes[i].id;
        tr.title = bookmarkNodes[i].title;
        tr.date = new Date(bookmarkNodes[i].dateAdded).toISOString().split('.')[0].replace('T',' ');
        tr.tags = tags;
        tr.url = bookmarkNodes[i].url;
        var o = {};
        o['B-' + tr.id] = tr;
        chrome.storage.local.set( o , function() {
           console.log("Saving " + JSON.stringify(o) ); });
    } 
    else {
        var separ = tags ? ";" : "";
        saveTreeNodes(bookmarkNodes[i].children, tags + separ + bookmarkNodes[i].title);
    }
  }
}


// Traverse the bookmark tree, and print the folder and nodes.
function dumpBookmarks() {

  chrome.bookmarks.getTree(
    function(bookmarkTreeNodes) {
      $('#table').empty();                                  // Header
      $('#table').append($('<tr>')   
              .append($('<th>').text("Id"))
              .append($('<th>').text("Title"))
              .append($('<th>').text("Date"))
              .append($('<th>').text("Tags"))
              .append($('<th>').text("URL"))
              );
      dumpTreeNodes(bookmarkTreeNodes, "", getOptions());   // Content
    });

  chrome.storage.local.get( null, function(bkms) {          // Colors

    var keys = Object.keys(bkms).filter(isTested);
    var nbBookmarks = keys.length;
    console.info("Retrieved "+ nbBookmarks + " tested bookmarks" );
    if (nbBookmarks < 2) {
        console.warn("No tested bookmarks in LocalStorage!");
        return;
    }
    keys.forEach( function (key) {
      chrome.storage.local.get( key, function (bm) {

            if (Object.keys(bm).length == 0)  return;
            var bookma = Object.values(bm)[0];
            console.log("bkm: "+ JSON.stringify(bookma));
            var elem = document.getElementById("tr"+bookma.id);
            if (!elem) {
                console.warn("Cannot find tr: " + bookma.id + ".");
                return;
            };
            if (bookma.status == 200) {
                elem.style.color = "green";
            } else {
                elem.style.color = "red";
            }
        });
    });
  });
}


function dumpTreeNodes(bookmarkNodes, tags, options) {
  for (var i = 0; i < bookmarkNodes.length; i++) {
    if (bookmarkNodes[i].url) {
        var tr = $('<tr id="tr'+ bookmarkNodes[i].id  +'">');
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
  };
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

