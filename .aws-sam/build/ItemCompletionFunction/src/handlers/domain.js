const { time } = require("console");

const VALID_EVENT_TYPE = [
    'ITEM',
    'CARGO'
];


const VALID_STATUS = [
    'SENT',
    'HANDLED_BY_CARRIER',
    'CARGO_PACKAGED',
    'DELIVERED'
];

 class TrackingEvent {

    constructor(
          trackingNumber,
          eventType,
          timestamp,
          status) {


            this.trackingNumber = trackingNumber;
            this.eventType = eventType;
            this.timestamp = timestamp;
            this.status = status;

    }
}


class ItemTrackingEvent extends TrackingEvent {

    constructor(
         trackingNumber,
         timestamp,
         status,
         cargoTrackingNumber
    ) {
        super(
            trackingNumber,
            'ITEM',
            timestamp,
            status);

            this.cargoTrackingNumber = cargoTrackingNumber;
    }
}

class CargoTrackingEvent extends TrackingEvent {

    constructor(
         trackingNumber,
         timestamp,
         status,
         leaving,
    ) {
        super(
            trackingNumber,
            'CARGO',
            timestamp,
            status);

            this.location = leaving;
    }
}


class TimelineEvent{
    constructor( eventStatus,  timestamp){}
}


class AggItem {
 

    constructor(
         trackingNumber, 
         itemEvents,
         cargoEvents) {

            this.trackingNumber = trackingNumber;
            this.itemEvents = itemEvents;
            this.cargoEvents = cargoEvents;
            this.needItemCompletion = false;
            this.timeline = [];

            let cpt = itemEvents.length;

            for(const s of VALID_STATUS){ 
                if(!this.needItemCompletion 
                    && itemEvents.filter(e => e.status == s).length == 0
                    && cpt > 0){

                    this.needItemCompletion = true;

                }
                cpt--;
            }

            this.timeline = [];
            itemEvents.forEach(ie => {
                this.timeline.push({
                    eventStatus: ie.status,
                    timestamp: ie.timestamp
                })
            })
            cargoEvents.forEach(ce => {
                this.timeline.push({
                    eventStatus: ce.status,
                    timestamp: ce.timestamp
                })
            })

            this.timeline.sort((a,b)=>{
                return a.timestamp.localeCompare(b.timestamp);
            });

        }


     
}


class AggCargo {
    
    constructor(
         trackingNumber, 
         events) {

            this.trackingNumber = trackingNumber;
            this.events = events;
         }
}

exports.AggCargo = AggCargo;
exports.AggItem = AggItem;
exports.TrackingEvent = TrackingEvent;
exports.ItemTrackingEvent = ItemTrackingEvent;
exports.CargoTrackingEvent = CargoTrackingEvent;
exports.TimelineEvent = TimelineEvent;

