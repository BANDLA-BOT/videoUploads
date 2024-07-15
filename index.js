const express = require('express');
const fs = require('fs');

const app = express()

const videos = {
    'port':"public/videos/portfolio.mp4",
    'port2':"public/videos/portfolio.mp4"
}
app.get('/videos/:filename', (req,res)=>{
    const fileName = req.params.filename
    const filePath = videos[fileName]
    if(!filePath){
        return res.status(404).send('File not found')
    }
    const stat = fs.statSync(filePath)
    const filesize = stat.size;
    const range = req.headers.range
    if(range){
        const parts = range.replace(/bytes=/, '').split('-')
        const start = parseInt(parts[0], 10)
    }
})

app.listen(5000, ()=>{
    console.log('Server running')
})