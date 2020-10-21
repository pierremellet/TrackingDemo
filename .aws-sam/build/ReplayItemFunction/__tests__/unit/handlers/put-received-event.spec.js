const AWS = require('aws-sdk-mock');

AWS.mock('Kinesis', 'putRecord', function (params, callback){
  callback(null, 'successfully put record in stream');
});

const lambda = require('../../../src/handlers/put-received-event.js');
 

describe('Test putItemHandler', () => {
    beforeAll(() => {
        process.env.OUTPUT_STREAM = 'TRACKING_STREAM';
    });

    it('Test with simple posted tracking event', async () => {

        const event = {
            body: '{"trackingNumber":"12345", "eventType":"ITEM"}',
            headers: {},
            multiValueHeaders: {},
            httpMethod: 'POST',
            isBase64Encoded: false,
            multiValueQueryStringParameters: null,
            path: '/',
            pathParameters: null,
            queryStringParameters: null,
            requestContext: null,
            resource: null,
            stageVariables: null
        };

        const res = await lambda.handler(event);
        console.log(res);
    });

    it('Test with wrong posted tracking event Type', async () => {

        let error = null;

        const event = {
            body: '{"trackingNumber":"12345", "eventType":"PARCEL"}',
            headers: {},
            multiValueHeaders: {},
            httpMethod: 'POST',
            isBase64Encoded: false,
            multiValueQueryStringParameters: null,
            path: '/',
            pathParameters: null,
            queryStringParameters: null,
            requestContext: null,
            resource: null,
            stageVariables: null
        };


        try {
            const res = await lambda.handler(event);
            console.log(res);
        } catch (err) {
            expect(error).toBeDefined();
        }

    });

});