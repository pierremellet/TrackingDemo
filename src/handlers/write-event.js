const AWS = require('aws-sdk');
const { AggCargo, AggItem } = require('./domain.js');

const docClient = new AWS.DynamoDB.DocumentClient({
    maxRetries: 1
});
const kinesisClient = new AWS.Kinesis({
    apiVersion: "2013-12-02",
});

const itemTableName = process.env.ITEM_STORE_TABLE;
const eventTableName = process.env.EVENT_STORE_TABLE;
const cargoTableName = process.env.CARGO_STORE_TABLE;
const completionStreamName = process.env.COMPLETION_REQUEST_STREAM;

async function replayCargo(cargoTrackingNumber) {

    const getEventsIP = {
        ExpressionAttributeNames: {
            '#n1': 'trackingNumber'
        },
        ExpressionAttributeValues: {
            ":v1": cargoTrackingNumber
        },
        KeyConditionExpression: "#n1 = :v1",
        TableName: eventTableName
    };

    const data = await docClient.query(getEventsIP).promise();

    const aggCargo = new AggCargo(cargoTrackingNumber, data.Items);

    const putItemParams = {
        Item: JSON.parse(JSON.stringify(aggCargo)),
        TableName: cargoTableName
    }

    await docClient.put(putItemParams).promise();

    return aggCargo;
}

/**
 * @returns {AggItem}
 * @param {string} trackingNumber 
 */
async function replayItem(trackingNumber) {

    const getEventsIP = {
        ExpressionAttributeNames: {
            '#n1': 'trackingNumber'
        },
        ExpressionAttributeValues: {
            ":v1": trackingNumber
        },
        KeyConditionExpression: "#n1 = :v1",
        TableName: eventTableName
    };

    let itemEventsList = [];
    let cargoEventList = [];
    const itemEvents = await docClient.query(getEventsIP).promise();

    if (itemEvents.Items) {
        itemEventsList = itemEvents.Items;

        let cargoTrackingNumbers = [];

        for (const itemEvent of itemEventsList) {

            if (itemEvent.status == 'CARGO_PACKAGED' && itemEvent.cargoTrackingNumber) {
                cargoTrackingNumbers.push({
                    "trackingNumber": itemEvent.trackingNumber,
                    "cargoNumber": itemEvent.cargoTrackingNumber
                });
            }
        }


        for (const cargoTN of cargoTrackingNumbers) {
            if (cargoTN) {
                const cargoQuery = {
                    ExpressionAttributeNames: {
                        '#n1': 'trackingNumber',
                    },
                    ExpressionAttributeValues: {
                        ":v1": cargoTN.cargoNumber,
                    },
                    KeyConditionExpression: "#n1 = :v1",
                    TableName: eventTableName
                };
                const cargoEvents = await docClient.query(cargoQuery).promise();
                if (cargoEvents.Items) {
                    for (const item of cargoEvents.Items) {
                        cargoEventList.push(item);
                    }
                }
            }
        }
    }

    const aggItem = new AggItem(
        trackingNumber,
        itemEventsList,
        cargoEventList);




    return aggItem;
}

exports.replayItemHandler = async (event) => {

    if (event.pathParameters == null) {
        throw new Error("Missing parameter");
    }
    const trackingNumber = event.pathParameters['trackingNumber'];

    const aggItem = await replayItem(trackingNumber);

    var params = {
        TableName: itemTableName,
        Item: aggItem
    };
    await docClient.put(params).promise();

    return {
        isBase64Encoded: false,
        statusCode: 200,
        headers: {},
        body: JSON.stringify(aggItem)
    }
}

exports.projectionsHandler = async (event) => {

    let events = [];

    event.Records.forEach(async (record) => {
        const newEvent = record.dynamodb.NewImage;
        const trackingEvent = AWS.DynamoDB.Converter.unmarshall(newEvent);
        events.push(trackingEvent);
    });

    const itemsPutRequest = [];
    const cargoPutRequest = [];

    for (const evt of events) {
        const trackingNumber = evt.trackingNumber;

        if (evt.eventType == 'ITEM') {

            const existing = itemsPutRequest
                .filter(pr => pr.PutRequest.Item)
                .map(pr => pr.PutRequest.Item)
                .filter(item => (item).trackingNumber == trackingNumber).length;

            if (existing == 0) {
                const aggItem = await replayItem(trackingNumber);
                var params = {
                    Item: aggItem
                };


                itemsPutRequest.push({
                    PutRequest: params
                });

                if (aggItem.needItemCompletion) {
                    const record /*Kinesis.PutRecordInput*/ = {
                        Data: JSON.stringify(aggItem),
                        StreamName: completionStreamName,
                        PartitionKey: aggItem.trackingNumber
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

                }

            }
        }

        if (evt.eventType == 'CARGO') {
            console.info("Process CARGO " + trackingNumber);

            const existing = cargoPutRequest
                .filter(pr => pr.PutRequest.Item)
                .map(pr => pr.PutRequest.Item)
                .filter(item => (item).trackingNumber == trackingNumber).length;

            if (existing == 0) {
                const aggCargo = await replayCargo(trackingNumber);
                var params = {
                    Item: aggCargo
                };


                cargoPutRequest.push({
                    PutRequest: params
                });
            }
        }
    }

    const batchWriteItemInput = {
        RequestItems: {
        }
    }

    if (itemsPutRequest.length > 0 && itemsPutRequest.length <= 25) {
        batchWriteItemInput.RequestItems[itemTableName] = itemsPutRequest;
    }

    if (cargoPutRequest.length > 0 && cargoPutRequest.length <= 25) {
        batchWriteItemInput.RequestItems[cargoTableName] = cargoPutRequest;
    }
    console.info(JSON.stringify(batchWriteItemInput));

    await docClient.batchWrite(batchWriteItemInput).promise();

}
