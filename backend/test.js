import { getLatestVideosFromChannel } from './src/jobs/getChannelVideos.js';

const canalEjemplo = 'UC_x5XG1OV2P6uZZ5FSM9Ttw'; // Canal oficial de Google Developers

getLatestVideosFromChannel(canalEjemplo).then(videos => {
  console.log('🎬 Videos encontrados:', videos);
});