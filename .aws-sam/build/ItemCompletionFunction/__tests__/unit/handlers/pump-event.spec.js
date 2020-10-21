const AWS = require('aws-sdk-mock');
const sinon = require('sinon');


const { TrackingEvent } = require('../../../src/handlers/domain.js');

describe('Test pump event', () => {
 

    it('Test with simple record', async () => {
        const callback = sinon.fake.resolves("ok");
        AWS.mock('DynamoDB.DocumentClient', 'put', callback);
        const lambda = require('../../../src/handlers/pump-event.js');

        const res = await lambda.handler({
            Records: [
                {
                    kinesis: {
                        data: btoa(JSON.stringify(new TrackingEvent('1234', 'ITEM', '150435032', 'SENT', {})))
                    }
                }
            ]
        });

        expect(callback.calledOnce).toBeTruthy();

        AWS.restore("DynamoDB.DocumentClient");
    });


});