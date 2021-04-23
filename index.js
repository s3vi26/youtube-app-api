require('dotenv').config();
const serverless = require('serverless-http');
const express = require('express');
const app = express();
const axios = require('axios');

const { YOUTUBE_API, YOUTUBE_API_KEY, PLAYLIST_ID } = process.env;

app.post('/videos', async function (req, res) {
  const body = req.body.toString('utf8');
  const { map, agent, skill } = JSON.parse(body);
  try {
    const videos = await axios.get(`${YOUTUBE_API}/playlistItems?playlistId=${PLAYLIST_ID}&part=snippet&key=${YOUTUBE_API_KEY}`);
    const { items } = videos.data;
    const videoIds = items.map(item => item.snippet.resourceId.videoId);
    const newVideos = [];
    for (const videoId of videoIds) {
      const video = await axios.get(`${YOUTUBE_API}/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`);
      const { items } = video.data;
      items.forEach(item => newVideos.push(item));
    }
    const filteredVideos = newVideos.filter(item => {
      const { tags } = item.snippet;
      if (tags.includes(map) && tags.includes(agent) && tags.includes(skill)) {
        return item;
      }
    });
    res.json({
      filteredVideos
    })

  } catch (e) {
    console.log('Error occured');
    console.log(e);
  }
});

module.exports.handler = serverless(app);