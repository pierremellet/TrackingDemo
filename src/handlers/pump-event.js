const AWS = require('aws-sdk');


const docClient = new AWS.DynamoDB.DocumentClient({
    maxRetries: 2
});

const tableName = process.env.EVENT_STORE_TABLE;

exports.handler = async (event) => {

    let putPromises /* Promise<any>[]*/ = [];
    const eventPutRequest = [];

    const reversedRecrods = event.Records.reverse();

    //We reversed records to process the latest received events first
    reversedRecrods.forEach((record) => {
        // Kinesis data is base64 encoded so decode here
        var payload = JSON.parse(Buffer.from(record.kinesis.data, 'base64').toString('ascii'));

        const exist = eventPutRequest.filter(epr => 
        epr.PutRequest.Item.trackingNumber == payload.trackingNumber && epr.PutRequest.Item.status == payload.status).length;
        if (!exist) {
            eventPutRequest.push({
                PutRequest: {
                    Item: payload
                }
            });
        }        
    });

    console.info(JSON.stringify(eventPutRequest));

    while (eventPutRequest.length > 0) {
        const sub = eventPutRequest.slice(0, 25);
        const batch = {
            RequestItems:{}
        }
        batch.RequestItems[tableName] = sub;
        putPromises.push(docClient.batchWrite(batch).promise());
        eventPutRequest.splice(0, 25);
    }

    return Promise.all(putPromises).then((res) => {
        console.info("DynamoDB : " + JSON.stringify(res));
    }).catch(err => console.error(JSON.stringify(err)));

}
