const AWS = require('aws-sdk');


exports.handler = async (event) => {

    event.Records.forEach(async (record) => {
        const updatedItem = record.dynamodb.NewImage;


        if (updatedItem.needItemCompletion) {
            console.info("Item " + updatedItem.trackingNumber + " need completion")
        }
        console.info("Item : " + JSON.stringify(updatedItem));
    });
}
