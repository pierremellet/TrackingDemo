const { CargoTrackingEvent, ItemTrackingEvent } = require('./domain.js');
const AWS = require('aws-sdk');

const kinesisClient = new AWS.Kinesis({
    apiVersion: "2013-12-02",
});

exports.handler = async (receivedEvent) => {

    const streamName = process.env.OUTPUT_STREAM;

    if (receivedEvent.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${receivedEvent.httpMethod} method.`);
    }

    console.info('received:', receivedEvent);
    const response = {
        statusCode: 200,
        body: ''
    };

    if (receivedEvent.body) {
        const body = JSON.parse(receivedEvent.body);

        let event = null;

        if (body.eventType == 'ITEM') {
            event = new ItemTrackingEvent(
                body.trackingNumber,
                body.timestamp,
                body.status,
                body.cargoTrackingNumber
            );
        }

        if (body.eventType == 'CARGO') {
            event = new CargoTrackingEvent(
                body.trackingNumber,
                body.timestamp,
                body.status,
                body.leaving
            );
        }

        if(!event){
            throw new Error(`Wrong type: ${body.eventType}.`);
        }

        const response = {
            statusCode: 200,
            body: ''
        };

        const record /*Kinesis.PutRecordInput*/ = {
            Data: JSON.stringify(event),
            StreamName: streamName,
            PartitionKey: event.trackingNumber
        };

        await kinesisClient.putRecord(record,
            (err, data) => {
                console.info("PutRecord : " + JSON.stringify(data));
                if (err) {
                    console.error(err);
                    response.statusCode = 400;
                }
            }
        ).promise();

        response.body = JSON.stringify(record);

        console.info(`response from: ${receivedEvent.path} statusCode: ${response.statusCode} body: ${response.body}`);
    } else {
        response.statusCode = 403;
    }
    return response;
}
