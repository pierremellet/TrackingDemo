const request = require('request')
const https = require('https');
const { format } = require('path');

const endpointURL = process.argv[2];

console.log(endpointURL);

function sendEvent(event) {

  const data = JSON.stringify(event);

  const options = {
    hostname: endpointURL,
    port: 443,
    path: '/Prod/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };


  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      resolve(res);
    })

    req.on('error', error => {
      reject(error);
    })

    req.write(data);
    req.end();
  });

}

function generateEvents(i) {
  ets = [];
  const cargoID = (Math.floor(Math.random() * 100) + 1);
  const start = Date.now();
  ets.push({
    "trackingNumber": "LS" + i + "FR",
    "eventType": "ITEM",
    "timestamp": (start + i + 1) + "",
    "status": "SENT"
  })

  ets.push({
    "trackingNumber": "LS" + i + "FR",
    "eventType": "ITEM",
    "timestamp": (start + i + 2) + "",
    "status": "HANDLED_BY_CARRIER"
  })

  ets.push({
    "trackingNumber": "LS" + i + "FR",
    "eventType": "ITEM",
    "timestamp": (start + i + 3) + "",
    "status": "CARGO_PACKAGED",
    "cargoTrackingNumber": "CARGO" + cargoID
  })

  ets.push({
    "trackingNumber": "LS" + i + "FR",
    "eventType": "ITEM",
    "timestamp": (start + i + 10000) + "",
    "status": "DELIVERED"
  })

  ets.push({
    "trackingNumber": "CARGO" + cargoID,
    "eventType": "CARGO",
    "timestamp": (start + i + 4) + "",
    "status": "CARGO_GONE",
    "leaving": "cn"
  })
  ets.push({
    "trackingNumber": "CARGO" + cargoID,
    "eventType": "CARGO",
    "timestamp": (start + i + 5) + "",
    "status": "CARGO_ARRIVED",
    "leaving": "fr"
  })

  ets.sort((a, b) => a.timestamp > b.timestamp);

  return ets;
}

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function requestItem(seed){
  if(seed > 0){
    const options = {
      hostname: endpointURL,
      port: 443,
      path: '/Prod/items/LS'+seed+'FR',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    return new Promise((resolve, reject) => {
      const req = https.request(options, res => {
        console.log("GET - "+'LS'+seed+'FR')
        resolve(res);
      })
  
      req.on('error', error => {
        reject(error);
      })
      req.end();
    });
  }else{
    return new Promise((res, rej)=> {
      res();
    });
  }
}

async function run() {

  for (var i = 8047; i < 4000000; i++) {
    var events = generateEvents(i);
    for (var event of events) {
      console.log(JSON.stringify(event));
      sendEvent(event).catch(err => console.error(err));
      await sleep(50);
    }
    const randomTrackingNumber = (Math.floor(Math.random() * i) + 0);
    requestItem(randomTrackingNumber-500).catch(err => console.error(err));
  }
  return "done";
}

run().then(res => console.log(res)).catch(err => console.error(err));