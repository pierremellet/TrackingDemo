const AWS = require('aws-sdk-mock');
const sinon = require('sinon');
const event = require('../../../events/event-dynamodb-stream.json');


 

describe('Test Write event to item store', () => {


    const callback = sinon.fake.resolves("ok");
    AWS.mock('DynamoDB.DocumentClient', 'batchWrite', callback);

    const lambda = require('../../../src/handlers/write-event.js');


    it('Test receive dynamo stream event and store to dynamo', async () => {
        const res = await lambda.projectionsHandler(event);
    }); 

});