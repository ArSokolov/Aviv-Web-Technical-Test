# AVIV technical test solution

## Intro & Disclaimer

I didn't have experience in NodeJs and in developing backends with TypeScript previously. I hope you will account that.
I treated this as a kind of pet project, and you can see some experimenting leftovers and parts of different approaches.

## Notes

- listing creation is not idempotent so there could be doubles.
  Consider adding idempotency key or generate uuid-like id on the client.

- there is no uniqueness constraints on listing,
  I don't know the business requirements for that, but it is something to consider in the real world scenario.

- transaction support is written more like PoC, rather that solid solution. In real world I would tend to use dedicated
  library for working with db.

- Things that left over because of lack of time:
  - didn't wrote api tests and e2e tests
  - service layer is not well-defined (sometimes I used repo directly instead of going through service)
  - I'm not sure if application-level design (classes, folders) and code style is aligned with nodejs-world conventions and common practices.
  - Some parts (like ListingRepo and PriceRepo) done differently, and it sometimes differs from existing project style, 
  so on the real project I would follow style guides and conventions of the project/team/company and ecosystem (nodejs) best and common practices 


- some notes I wrote down below as answers to the questions

## Questions

This section contains additional questions your expected to answer before the debrief interview.

- **What is missing with your implementation to go to production?**
    - add observability of the app: add logging and collecting metrics, define SLOs on those.
    - Probably there should be a pagination and different filtering criteria support for listings
    - address security issues:
        - Authorisation for different action in the system (creating, editing listing data)
        - dealing with ddos
        - preventing sql injections and other security vulnerabilities typical for web
    - consider to use connection pool for db
    - consider using caches
    - consider deleting old data and/or historical data storing

- **How would you deploy your implementation?**
    - it depends on:
        - current deployment practices and competences in the team/company
        - forecasted load and deployment scenarios (like A/B testing or need for a canary deployment)
    - if it is not heavily loaded by traffic I would consider use serverless deployment
    - but in general I would probably use kubernetes and deploy docker app to its own pods within the same service.
      (but probably in that case you need to move it from typescript-serverless to different http server/routing library)
    - other possible option is to deploy it as docker container to dedicated ec2 machines in AWS,
      or virtual machines in on premise setup if there is a good reason to do so (regulations and compliance)


- **If you had to implement the same application from scratch, what would you do differently?**
    - I would propose that prices should be stored in long/decimal numeric types in database,
      and maybe with configurable currency (not hardcoded euro). Also, add instrumentation to dealing with prices in
      typescript. E.g. dedicated data types or even bring some specialized money library.
    - use library for sql/db, like sql query builders and auto generated object-row mappers

- **The application aims at storing hundreds of thousands listings and millions of prices, and be accessed by millions
  of users every month. What should be anticipated and done to handle it?**
    - on the system design level:
        - probably add CDN
        - load balancing
        - consider using other storage/db like DynamoDb, MongoDb, Cassandra, etc. 
Current load of 100s k listings and 1s kk prices and 1s kk users looks very manageable for Postgres, but it is not so 
scalable and will face limitations in case of future load growth. Also, there is a consideration about availability vs consistency tradeoff.  
        - consider geo-distributed deployments/partitioning if this is the case for user location distribution


## Time spent

I have spent about 3-4h on pure development, and also a few hours on refreshing typescript skills and setting up nodejs environment.
