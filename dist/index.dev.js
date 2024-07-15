"use strict";

var express = require('express');

var fs = require('fs');

var app = express();
var videos = {
  'port': "public/videos/portfolio.mp4",
  'port2': "public/videos/portfolio.mp4"
};
app.get('/videos/:filename', function (req, res) {
  var fileName = req.params.filename;
  var filePath = videos[fileName];

  if (!filePath) {
    return res.status(404).send('File not found');
  }

  var stat = fs.statSync(filePath);
  var filesize = stat.size;
  var range = req.headers.range;

  if (range) {
    var parts = range.replace(/bytes=/, '').split('-');
    var start = parseInt(parts[0], 10);
  }
});
app.listen(5000, function () {
  console.log('Server running');
});
//# sourceMappingURL=index.dev.js.map
