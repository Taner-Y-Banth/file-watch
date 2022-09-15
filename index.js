import fs from 'fs';
import { readFile } from 'fs/promises';
import minimist from 'minimist';
import { NstrumentaClient } from 'nstrumenta';
import ws from 'ws';

const argv = minimist(process.argv.slice(2));
const wsUrl = argv.wsUrl;

const nstClient = new NstrumentaClient();

const completed = [];
const directory = '../stable-diffusion-nst/stable-diffusion/outputs/txt2img-samples'

let timeoutID = undefined

fs.watch(directory, (eventType, filename) => {

  console.log(`event type is: ${eventType}`);
  
  if (eventType == 'change') {

    if (timeoutID) {
      clearTimeout(timeoutID);
    }

    timeoutID = setTimeout( async () => {
      completed.push(filename);
      console.log(`filename provided: ${filename}`);
      const buff = await readFile(`${directory}/${filename}`);
      nstClient.sendBuffer('postprocessing', buff);
      console.log('nstClient Sent Buffer')
    }, 400)
  }
}),

  nstClient.addListener("open", () => {
    console.log("websocket opened successfully");
  });

console.log("nstrumenta connect");

nstClient.connect({ wsUrl, nodeWebSocket: ws });