'use strict'

const Address = require('ipaddr.js')
const dns = require('dns')

/**
 * Checks if the client Hostname/IP is in the list of IPs allowed for access.
 *
 * @param clientIp Client IP address requesting access
 * @param whitelist list of allowed ips
 * @return {boolean}
 */
async function clientMatch(clientIp, whitelist) {
    if (whitelist.includes('*') || whitelist.includes('0.0.0.0')) return Promise.resolve(true)

    let isMatch = false
    try {
        if ((clientIp && Address.isValid(clientIp)) && whitelist.length) {
            // Get the host IP provided in the whitelist.
            whitelist = await Promise.all(whitelist.map(getIPFromHost))

            if (clientIp === '::1' || clientIp === '::ffff:127.0.0.1') clientIp = '127.0.0.1'

            // `Address.process` return the IP instance in IPv4 or IPv6 form.
            // It will return IPv4 instance if it's a IPv4 mapped IPv6 address
            clientIp = Address.process(clientIp)

            whitelist.some(function (e) {
                // IPv6 address has 128 bits and IPv4 has 32 bits.
                // Setting the routing prefix to all bits in a CIDR address means only the specified address is allowed.
                e = e || ''
                e = e.indexOf('/') === -1 ? e + '/128' : e

                const range = e.split('/')
                if (range.length === 2 && Address.isValid(range[0]) && isNumeric(range[1])) {
                    const ip = Address.process(range[0])
                    const bit = parseInt(range[1], 10)

                    // `IP.kind()` return `'ipv4'` or `'ipv6'`. Only same type can be `match`.
                    if (clientIp.kind() === ip.kind()) {
                        isMatch = clientIp.match(ip, bit)
                    }
                }
            })
        }
    } catch (e) {
        return Promise.reject(e)
    }
    return Promise.resolve(isMatch)
}

/**
 * Check if it's a number.
 *
 * @param number
 * @return {boolean}
 */
function isNumeric(number) {
    return !isNaN(parseFloat(number)) && isFinite(number)
}

/**
 *  Get DNS from a host name.
 *
 * @private
 * @param host
 * @return Promise<void>
 */
async function getIPFromHost(host) {
    return new Promise((resolve, reject) => {
        if (host === '::1') return resolve('127.0.0.1')
        dns.lookup(host, async (err, ip) => {
            if (err) return resolve()
            return resolve(ip)
        })
    })
}

/**
 * Middleware to validate allowed Hosts/IPs and block access to those that are not on the whitelist.
 *
 * @param hostsAllowed Allowed Hosts/IPs that the middleware should use in the validation.
 * @param options Middleware settings.
 * @return {Function}
 */
function whitelist(hostsAllowed, options) {
    const _options = {
        // log: Pass a log function or `false` to disable log.
        // `Function(String clientIp, Boolean access)`
        log: function (clientIp, accessDenied) {
            console.log(`Access ${accessDenied ? 'denied' : 'allowed'} for ip address ${clientIp}`)
        },
        // Message sent when the request is denied, can be a string or JSON.
        // `Function(String clientIp)`
        message: function (err, clientIp) {
            return {
                code: '401',
                message: 'Unauthorized',
                description: `Access denied for IP address ${clientIp}`
            }
        }
    }

    // Override default options.
    _options.log = options && options.log ? options.log : _options.log
    _options.message = options && options.message ? options.message : _options.message

    // Express middleware.
    return function (req, res, next) {
        const clientIp = req.ip || req.connection.remoteAddress

        // Treats the whitelist when it is string.
        // Useful when hosts / ips are provided by environment variable.
        if (typeof hostsAllowed === 'string') {
            hostsAllowed = hostsAllowed
                .replace(/[\[\]]/g, '')
                .split(',')
                .map(item => item.trim())
        }

        clientMatch(clientIp, hostsAllowed)
            .then(isMatch => {
                if (typeof _options.log === 'function') {
                    _options.log.apply(null, [clientIp, !isMatch])
                }

                if (!isMatch && typeof _options.message === 'function') {
                    res.status(401).send(_options.message(null, clientIp))
                } else {
                    next()
                }
            })
            .catch(err => {
                res.status(401).send(_options.message(err, clientIp))
            })
    }
}

module.exports = whitelist
