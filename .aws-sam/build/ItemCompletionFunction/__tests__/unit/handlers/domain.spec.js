const { AggItem } = require("../../../src/handlers/domain.js");

describe('Test pump event',  () => {
 
    beforeAll(() => {
     });

    afterAll(() => {
     });

    it('Test item without needs of completion', () => { 

        const itemEvents = [
            {
                "trackingNumber": "LS95418700CH",
                "eventType": "ITEM",
                "timestamp": "1",
                "status": "SENT"
            },

            {
                "trackingNumber": "LS95418700CH",
                "eventType": "ITEM",
                "timestamp": "2",
                "status": "HANDLED_BY_CARRIER"
            }
        ];
        
        const cargoEvents = [];

        const aggItem = new AggItem("1234", itemEvents, cargoEvents);

        expect(aggItem.needItemCompletion).toBeFalsy();

    });
    it('Test item wich needs completion', () => { 

        const itemEvents = [
            {
                "trackingNumber": "LS95418700CH",
                "eventType": "ITEM",
                "timestamp": "1",
                "status": "SENT"
            },

            {
                "trackingNumber": "LS95418700CH",
                "eventType": "ITEM",
                "timestamp": "2",
                "status": "DELIVERED"
            }
        ];
        
        const cargoEvents = [];

        const aggItem = new AggItem("1234", itemEvents, cargoEvents);

        expect(aggItem.needItemCompletion).toBeTruthy();

    });



});