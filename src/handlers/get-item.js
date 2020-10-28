const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient({
    maxRetries: 2
});

const tableName = process.env.ITEM_STORE_TABLE;

exports.handler = async (/*APIGatewayEvent*/ event) => {
 
    if(event.pathParameters == null){
        throw new Error("Missing parameter");
    }

    const trackingNumber = event.pathParameters['trackingNumber'];

    const getItemInputParams = {
        Key: {
            trackingNumber: trackingNumber
        },
        TableName: tableName
    };

    const data = await docClient.get(getItemInputParams).promise();
     return {
        isBase64Encoded: false,
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET"
        },
        body: JSON.stringify(data.Item)
    };



}
