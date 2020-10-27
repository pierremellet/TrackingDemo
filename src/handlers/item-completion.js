const AWS = require('aws-sdk');


exports.handler = async (event) => {

    event.Records.forEach(async (record) => {
        var updatedItem = JSON.parse(Buffer.from(record.kinesis.data, 'base64').toString('ascii'));

        if (updatedItem.needItemCompletion) {
            console.info("Item " + updatedItem.trackingNumber + " need completion")
        }
        console.info("Item : " + JSON.stringify(updatedItem));
    });
}
