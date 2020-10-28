const AWS = require('aws-sdk-mock');
const sinon = require('sinon');


const { TrackingEvent } = require('../../../src/handlers/domain.js');

describe('Test pump event', () => {
 

    it('Test with simple record', async () => {
        process.env.EVENT_STORE_TABLE = "EVENTS_STORE";
        const callback = sinon.fake.resolves("ok");
        AWS.mock('DynamoDB.DocumentClient', 'batchWrite', callback);
        const lambda = require('../../../src/handlers/pump-event.js');


        const records = {
            Records: [
                
            ]
        }

        for(var i=0; i<110; i++){
            records.Records[i] = {
                kinesis: {
                    data: btoa(JSON.stringify(new TrackingEvent(i, 'ITEM', '150435032', 'SENT', {})))
                }
            }
        }

        await lambda.handler(records);

        expect(callback.callCount).toEqual(5);

        AWS.restore("DynamoDB.DocumentClient");
    });


});