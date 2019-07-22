
IP Allowed 
=========================  
[![License][license-image]][license-url] [![NPM Version][npm-image]][npm-url] [![NPM Downloads][downloads-image]][npm-url] [![Travis][travis-image]][travis-url] [![Coverage][coverage-image]][coverage-url]  [![Vulnerabilities][known-vulnerabilities-image]][known-vulnerabilities-url]  [![Dependencies][dependencies-image]][dependencies-url] [![DependenciesDev][dependencies-dev-image]][dependencies-dev-url] [![Vulnerabilities][known-vulnerabilities-image]][known-vulnerabilities-url]  [![Releases][releases-image]][releases-url]  [![Contributors][contributors-image]][contributors-url] [![Issues][issues-image]][issues-url]
 
---
A middleware for access permissions based on IP/host addresses. Customers who are not on the whitelist have their requests blocked. The response of the request is resumed with status code 401 and an error message that may be pernanalized.
  
## Features  
* Create a list of permissions with hostnames and IP addresses and control who can access the resources of your API;  
* Support IPv4, IPv6, CIDR format & IPv4 mapped IPv6 addresses;  
* Custom log function;  
* Custom message function.  
  
## Installation  
> `npm i ip-allowed --save`  
> 
------------  
  
## Usage  
To use middleware is very simple, just import and then define your list of permissions and available options, such as log and message.  
  
```js  
const whitelist = require('ip-allowed');  
  
// Create middleware.  
const middleware = whitelist(['127.0.0.1', 'www.client.com'], options);  
  
// Injecting middleware into instance express  
const express = require('express');  
const app = express();  
app.use(middleware);  
```  
### Options  
```js  
const options = {    
    log: (clientIp, accessDenied) => {  
         console.log(`${clientIp} access ${accessDenied ? 'denied!' : 'allowed!'}`)    
    },   
    message: function (err, clientIp) {  
         return {error: `Client with IP address ${clientIp} is not allowed!`}    
    }   
};  
```  

> The options are not mandatory and have default values.  
- **log**: Allows you to manipulate the log on each request. To disable log assign its value equal to `false`.  
  - Valor default:   
   ```js  
   (clientIp, accessDenied) => {    
         console.log(`Access ${accessDenied ? 'denied' : 'allowed'} for ip address ${clientIp}`)    
   }  
   ```  
- **message**: Allows you to handle the error message when the client IP is not on the whitelist.
  - Valor default:   
   ```js  
   (err, clientIp) => {    
        return {    
            code: '401',    
            message: 'Unauthorized',    
            description: `Access denied for IP address ${clientIp}`    
        }    
   }  
   ```  
     
[//]: # (These are reference links used in the body of this note.)  
[license-image]: https://img.shields.io/badge/license-Apache%202-blue.svg
[license-url]: https://github.com/nutes-uepb/ip-allowed/blob/master/LICENSE  
[npm-image]: https://img.shields.io/npm/v/ip-allowed.svg?color=red&logo=npm&  
[npm-url]: https://npmjs.org/package/ip-allowed  
[downloads-image]: https://img.shields.io/npm/dt/ip-allowed.svg?logo=npm   
[travis-image]: https://img.shields.io/travis/nutes-uepb/ip-allowed.svg?logo=travis
[travis-url]: https://travis-ci.org/nutes-uepb/ip-allowed  
[coverage-image]: https://coveralls.io/repos/github/nutes-uepb/ip-allowed/badge.svg  
[coverage-url]: https://coveralls.io/github/nutes-uepb/ip-allowed?branch=master  
[known-vulnerabilities-image]: https://snyk.io/test/github/nutes-uepb/ip-allowed/badge.svg?targetFile=package.json  
[known-vulnerabilities-url]: https://snyk.io/test/github/nutes-uepb/ip-allowed?targetFile=package.json
[dependencies-image]: https://david-dm.org/nutes-uepb/ip-allowed.svg
[dependencies-url]: https://david-dm.org/nutes-uepb/ip-allowed
[dependencies-dev-image]: https://david-dm.org/nutes-uepb/ip-allowed/dev-status.svg
[dependencies-dev-url]: https://david-dm.org/nutes-uepb/ip-allowed?type=dev
[releases-image]: https://img.shields.io/github/release-date/nutes-uepb/ip-allowed.svg
[releases-url]: https://github.com/nutes-uepb/ip-allowed/releases
[contributors-image]: https://img.shields.io/github/contributors/nutes-uepb/ip-allowed.svg?color=green
[contributors-url]: https://github.com/nutes-uepb/ip-allowed/graphs/contributors
[issues-image]: https://img.shields.io/github/issues/nutes-uepb/ip-allowed.svg  
[issues-url]: https://github.com/nutes-uepb/ip-allowed/issues
