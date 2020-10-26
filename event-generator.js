const request = require('request')
const https = require('https')

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

function generateEvents() {
  ets = [];
  const start = Date.now();
  for (var i = 1; i < 10000; i++) {
    ets.push({
      "trackingNumber": "LS" + i + "FR",
      "eventType": "ITEM",
      "timestamp": (start+i+1)+"",
      "status": "SENT"
    })

    ets.push({
      "trackingNumber": "LS" + i + "FR",
      "eventType": "ITEM",
      "timestamp": (start+i+2)+"",
      "status": "HANDLED_BY_CARRIER"
    })

    ets.push({
      "trackingNumber": "LS" + i + "FR",
      "eventType": "ITEM",
      "timestamp": (start+i+3)+"",
      "status": "CARGO_PACKAGED",
      "cargoTrackingNumber": "CARGO"+(Math.floor(Math.random() * 100) + 1) 
    })

    ets.push({
      "trackingNumber": "LS" + i + "FR",
      "eventType": "ITEM",
      "timestamp": (start+i+10000)+"",
      "status": "DELIVERED"
    })
  }

  for(var i=1; i<100; i++){
    ets.push({
      "trackingNumber": "CARGO" + i,
      "eventType": "CARGO",
      "timestamp": (start+i+4)+"",
      "status": "CARGO_GONE",
      "leaving": "cn"
    })
    ets.push({
      "trackingNumber": "CARGO" + i,
      "eventType": "CARGO",
      "timestamp": (start+i+5)+"",
      "status": "CARGO_ARRIVED",
      "leaving": "fr"
    })
  }

  ets.sort((a,b)=>a.timestamp > b.timestamp);

  return ets;
}

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function run() {
  eventsCatalogue = generateEvents();

  for (var i = 0; i < eventsCatalogue.length; i++) {
    console.log(JSON.stringify(eventsCatalogue[i]));    
    sendEvent(eventsCatalogue[i]);
    await sleep(100);
  }
  return "done";
}
  
run().then(res => console.log(res)).catch(err => console.error(err));