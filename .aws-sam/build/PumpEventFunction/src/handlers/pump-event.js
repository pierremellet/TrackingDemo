const AWS = require('aws-sdk');


const docClient = new AWS.DynamoDB.DocumentClient({
    maxRetries: 2
});

const tableName = process.env.EVENT_STORE_TABLE;

exports.handler = async (event) => { 

    let putPromises /* Promise<any>[]*/ = [];

    console.info("Received event");

    event.Records.forEach((record) => {
        // Kinesis data is base64 encoded so decode here
        var payload = JSON.parse(Buffer.from(record.kinesis.data, 'base64').toString('ascii'));

        var params = {
            TableName: tableName,
            Item: payload
        };

        putPromises.push(docClient.put(params).promise()); 

        
    console.info("Add promise to store event");
    });

    return Promise.all(putPromises).then((res) => {
        console.info("DynamoDB : "+JSON.stringify(res));
    }).catch(err=> console.error(JSON.stringify(err))); 

}
