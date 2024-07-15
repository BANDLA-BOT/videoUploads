"use strict";

var express = require('express');

var cors = require('cors');

var mongoose = require('mongoose');

var multer = require('multer');

var ffmpeg = require('fluent-ffmpeg');

var fs = require('fs');

var path = require('path');

var app = express();
app.use(cors());
app.use(express.json());

var Db = function Db() {
  mongoose.connect('mongodb://localhost:27017/videos').then(function (res) {
    console.log('Database connected ');
    app.listen(PORT, function () {
      console.log('Server connected on ', PORT);
    });
  })["catch"](function (error) {
    console.log(error.message);
  });
};

app.use('/public', express["static"](path.join(__dirname + '/public')));
var PORT = 8000; //Multer

var storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    if (!fs.existsSync('public')) {
      fs.mkdirSync('public');
    }

    if (!fs.existsSync('public/videos')) {
      fs.mkdirSync('public/videos');
    }

    cb(null, 'public/videos');
  },
  filename: function filename(req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
});
var upload = multer({
  storage: storage,
  fileFilter: function fileFilter(req, file, cb) {
    var ext = path.extname(file.originalname);

    if (ext !== '.mkv' && ext !== '.mp4') {
      return cb(new Error('Only videos are allowed!'));
    }

    cb(null, true);
  }
}); //MODEL

var videoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  videos: [{
    type: String
  }]
}, {
  timestamps: true
});
var VModel = mongoose.model('videos', videoSchema);
app.get('/videos', function (req, res) {
  fs.readdir('public/videos', function (err, files) {
    if (err) {
      res.status(500).json({
        message: 'Error reading video directory'
      });
      return;
    }

    var videos = files.filter(function (file) {
      return path.extname(file) === '.mp4';
    });
    res.json({
      videos: videos
    });
  });
});
app.post('/create', upload.single('video'), function _callee(req, res) {
  var filePath, qualities;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          filePath = req.file.path;
          qualities = [240, 360, 480, 720, 1080];
          qualities.forEach(function (quality) {
            var outputPath = path.join(__dirname, 'public/videos', "".concat(path.basename(filePath, path.extname(filePath)), "_").concat(quality, "p.mp4"));
            ffmpeg(filePath).videoCodec('libx264').size("?x".concat(quality)).output(outputPath).on('end', function () {
              console.log("Video transcoded to ".concat(quality));
            }).on('error', function (err) {
              console.error("Error transcoding video: ".concat(err.message));
            }).run();
          });

        case 3:
        case "end":
          return _context.stop();
      }
    }
  });
});
Db();
//# sourceMappingURL=server.dev.js.map
