# Log Collection

## Description

### Problem
A customer has asked you for a way to provide on-demand monitoring of various unix-based servers without having to log into each individual machine and opening up the log files found in `/var/log`. The customer has asked for the ability to issue a REST request to a machine in order to retrieve logs from `/var/log` on the machine receiving the REST request.

### Requirements
- Customer interface is a HTTP REST request
- Customer must be able to query the following:
  - for a specific file in `/var/log`
  - last `n` events of specified file 
  - basic text/keyword filtering of events
- The results returned must be reverse time ordered
- Must not use any pre-built log aggregation systems - this must be custom, purpose-built software.
- Minimize the number of external dependencies in the business logic code path (framework things like HTTP servers, etc are okay)
- Please commit and push code changes as you normally would - your thinking and working style is an important part for us to understand.

**Bonus**: The customer has a stretch goal for the ability to issue a REST request to one "master" server in order to retrieve logs from a list of  machines provided in the request. For this, there's no requirements for the protocol between the master server and other servers. 

**Bonus**: Basic UI for demo purposes.

## Installation
1. Install NodejS
2. Run `npm i`
3. Copy `.env.example` to `.env`

## Run
1. Run `npm run build` to compile the typescript
2. Run `npm start` to start the server

## Tests
1. Copy `test/resources/small.log` & `test/resources/medium.log` to `/var/log`
2. Run `npm test` to run all tests