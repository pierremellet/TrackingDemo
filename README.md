# A-Tracking

## Deployment

    npm run build

    npm run deploy

## Test tools

In order to test deployed architecture, use the following command :

    node event-generator.js 9nzs7j2hpe.execute-api.eu-west-3.amazonaws.com

This script will produce HTTP POST requests that create items    

## Swagger

    swagger: "2.0"
    info:
    version: "1.0"
    title: "A-Tracking-Ingest"
    basePath: "/Prod"
    schemes:
    - "https"
    paths:
    /:
        post:
        responses: {}
    /items/{trackingNumber}:
        get:
        responses: {}
    /replay/items/{trackingNumber}:
        post:
        responses: {}
