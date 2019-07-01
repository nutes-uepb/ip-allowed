[![License][license-image]][license-url] [![NPM Version][npm-image]][npm-url] [![NPM Downloads][downloads-image]][downloads-url] [![Travis][travis-image]][travis-url] [![Coverage][coverage-image]][coverage-url] [![Vulnerabilities][known-vulnerabilities-image]][known-vulnerabilities-url]

Express IP Whitelist
=========================
An express middleware for access permissions based on Host/IP addresses. Hosts/IPs of the clients that are not on the whitelist have access blocked.

### Features
* Create a list of permissions with hostnames and IP addresses and control who can access the resources of your API;
* Support IPv4, IPv6, CIDR format & IPv4 mapped IPv6 addresses;
* Custom log function;
* Custom message function.

### Installation
> `npm i @nutes-uepb/express-ip-whitelist`

------------

### Usage
To use middleware is very simple, just import and then define your list of permissions and available options, such as log and message.

```js
const whitelist = require('@nutes-uepb/express-ip-whitelist');

// Create middleware.
const middleware = whitelist(['127.0.0.1', 'www.client.com'], options);

// Injecting middleware into instance express
const express = require('express');
const app = express();
app.use(middleware);


```
#### Options
```js
const options = {  
  log: (clientIp, accessDenied) => {
      console.log(`${clientIp} access ${accessDenied ? 'denied!' : 'allowed!'}`)  
 }, message: function (err, clientIp) {  
	  return {error: `Client with IP address ${clientIp} is not allowed!`}  
 }};
```
> The options are not mandatory and have default values.
- **log**: Allows you to manipulate the log on each request. To disable log assign its value equal to `false`.
  - Valor default: 
	```js
	function (clientIp, accessDenied) {	
        console.log(`Access ${accessDenied ? 'denied' : 'allowed'} for ip address ${clientIp}`)  
	}
	```
- **message**: Allows you to handle the error message when the client IP is not on the whitelist. The status code will always be `401`.
  - Valor default: 
	```js
	function (err, clientIp) {  
        return {  
            code: '401',  
            message: 'Unauthorized',  
            description: `Access denied for IP address ${clientIp}`  
        }  
	}
	```
	
[//]: # (These are reference links used in the body of this note.)
[build-test]: <https://travis-ci.org/nutes-uepb/express-ip-whitelist>
[test-coverage]: <https://coveralls.io/github/nutes-uepb/express-ip-whitelist?branch=master>
[node.js]: <https://nodejs.org>
[npm.js]: <https://www.npmjs.com/>
[express]: <https://expressjs.com>

[license-image]: https://img.shields.io/github/license/mashape/apistatus.svg
[license-url]: https://github.com/nutes-uepb/express-ip-whitelist/blob/master/LICENSE
[npm-image]: https://img.shields.io/npm/v/express-ip-whitelist.svg
[npm-url]: https://npmjs.org/package/@nutes-uepb/express-ip-whitelist
[downloads-image]: https://img.shields.io/npm/dt/express-ip-whitelist.svg
[downloads-url]: https://npmjs.org/package/@nutes-uepb/express-ip-whitelist
[travis-image]: https://travis-ci.org/nutes-uepb/express-ip-whitelist.svg?branch=master
[travis-url]: https://travis-ci.org/nutes-uepb/express-ip-whitelist
[coverage-image]: https://coveralls.io/repos/github/nutes-uepb/express-ip-whitelist/badge.svg
[coverage-url]: https://coveralls.io/github/nutes-uepb/express-ip-whitelist?branch=master
[known-vulnerabilities-image]: https://snyk.io/test/github/nutes-uepb/express-ip-whitelist/badge.svg?targetFile=package.json
[known-vulnerabilities-url]: https://snyk.io/test/github/nutes-uepb/express-ip-whitelist?targetFile=package.json
