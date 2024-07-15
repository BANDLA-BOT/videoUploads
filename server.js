const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer')
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs')
const path = require('path')

const app = express();
app.use(cors())
app.use(express.json())
const Db = ()=>{
    mongoose.connect('mongodb://localhost:27017/videos').then((res)=>{
        console.log('Database connected ')
        app.listen(PORT, ()=>{
            console.log('Server connected on ', PORT )
        })
    }).catch((error)=>{
        console.log(error.message)
    })
}
app.use('/public', express.static(path.join(__dirname + '/public')))
const PORT = 8000
//Multer
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        if(!fs.existsSync('public')){
            fs.mkdirSync('public')
        }
        if(!fs.existsSync('public/videos')){
            fs.mkdirSync('public/videos')
        }
        cb(null, 'public/videos')
    },
    filename:function(req,file,cb){
        cb(null, Date.now()+file.originalname)
    }
})
const upload = multer({
    storage:storage,
    fileFilter:function(req,file,cb){
        var ext = path.extname(file.originalname)
        if(ext !== '.mkv' && ext !== '.mp4'){
            return cb(new Error('Only videos are allowed!'))
        }
        cb(null, true)
    }
})

//MODEL

const videoSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    videos:[{type:String}]

},{timestamps:true})
const VModel = mongoose.model('videos',videoSchema)

app.get('/videos', (req, res) => {
    fs.readdir('public/videos', (err, files) => {
      if (err) {
        res.status(500).json({ message: 'Error reading video directory' });
        return;
      }
  
      const videos = files.filter(file => path.extname(file) === '.mp4');
      res.json({ videos });
    });
  });


app.post('/create', upload.single('video'), async(req,res)=>{
     const filePath = req.file.path
     
     const qualities = [240, 360, 480, 720, 1080]
     qualities.forEach(quality =>{
        const outputPath = path.join(__dirname, 'public/videos', `${path.basename(filePath, path.extname(filePath))}_${quality}p.mp4`)
        ffmpeg(filePath)
        .videoCodec('libx264')
        .size(`?x${quality}`)
        .output(outputPath)
        .on('end', ()=>{
            console.log(`Video transcoded to ${quality}`)
        })
        .on('error', (err) => {
            console.error(`Error transcoding video: ${err.message}`);
          })
        .run()
     })
})







Db()
