const request = require('supertest')
const express = require('express')
const expect = require('chai').expect
const ipAllowed = require('../index.js')

describe('ipAllowed()', () => {
    describe('Requisitions that must be accepted', () => {
        it('Should accept requests only from the localhost', () => {
            const app = createServer(ipAllowed('localhost', {log: false}))

            return request(app)
                .get('/')
                .expect(200)
        })

        it('Should accept requests only from the 127.0.0.1', () => {
            const app = createServer(ipAllowed('127.0.0.1', {log: false}))

            return request(app)
                .get('/')
                .expect(200)
        })

        it('Should accept requests only from the ::1', () => {
            const app = createServer(ipAllowed('::1', {log: false}))

            return request(app)
                .get('/')
                .expect(200)
        })

        it('Should accept requests only from the IPv6', () => {
            const app = createServer(ipAllowed('0:0:0:0:0:ffff:7f00:1', {log: false}))

            return request(app)
                .get('/')
                .expect(200)
        })

        it('Should accept requests of any origin - *', () => {
            const app = createServer(ipAllowed('*', {log: false}))

            return request(app)
                .get('/')
                .expect(200)
        })

        it('Should accept requests of any origin - 0.0.0.0', () => {
            const app = createServer(ipAllowed('0.0.0.0', {log: false}))

            return request(app)
                .get('/')
                .expect(200)
        })

        context('Passing array with valid Hostnames', () => {
            it('Should accept requests only from the ["github.com", "localhost"]', () => {
                const app = createServer(ipAllowed(
                    ['github.com', 'localhost'],
                    {log: false}
                ))

                return request(app)
                    .get('/')
                    .expect(200)
            })

            it('Should accept requests only from the ["github.com", "127.0.0.1", "google.com"]', () => {
                const app = createServer(ipAllowed(
                    ['github.com', '127.0.0.1', 'google.com'],
                    {log: false}
                ))

                return request(app)
                    .get('/')
                    .expect(200)
            })
        })

        context('Passing array with valid IPs', () => {
            it('Should accept requests only from the ["127.0.0.1", "151.81.131.239"]', () => {
                const app = createServer(ipAllowed(
                    ['127.0.0.1', '151.81.131.239'],
                    {log: false}
                ))
                return request(app)
                    .get('/')
                    .expect(200)
            })

            it('Should accept requests only from the IP "[151.81.131.239]"', () => {
                const app = createServer(ipAllowed(
                    '[151.81.131.239]',
                    {log: false}
                ))
                app.enable('trust proxy')

                return request(app)
                    .get('/')
                    .set('X-Forwarded-For', '151.81.131.239')
                    .expect(200)
            })
        })
    })

    describe('Requests that should be blocked', () => {
        it('Should return 401 for requests other than coming from localhost', () => {
            const app = createServer(ipAllowed(
                ['localhost'],
                {log: false}
            ))
            app.enable('trust proxy')

            return request(app)
                .get('/')
                .set('X-Forwarded-For', '151.81.131.239')
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(401)
        })

        it('Should return 401 for requests other than coming from 151.81.131.239', () => {
            const app = createServer(ipAllowed(
                ['151.81.131.239'],
                {log: false}
            ))

            return request(app)
                .get('/')
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(401)
        })

        it('Should return 401 for invalid hostnames passed as parameter', () => {
            const app = createServer(ipAllowed(
                '"["test123"]"\'(123test*com)\'',
                {log: false}
            ))
            app.enable('trust proxy')

            return request(app)
                .get('/')
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(401)
        })

        context('Message when the request is blocked', () => {
            it('Should return 401 and in the body a json default with code, message and description', () => {
                const app = createServer(ipAllowed(
                    ['151.81.131.239'],
                    {log: false}
                ))
                app.enable('trust proxy')

                return request(app)
                    .get('/')
                    .set('X-Forwarded-For', '151.81.131.400')
                    .expect('Content-Type', 'application/json; charset=utf-8')
                    .expect(401)
                    .then(res => {
                        expect(res.body).to.have.property('code', 401)
                        expect(res.body).to.have.property('message', 'Unauthorized')
                        expect(res.body).to.have.property('description')
                        expect(res.body.description).to.have.string('Access denied for IP address')
                    })
            })

            it('Should return custom text message', () => {
                const app = createServer(ipAllowed(
                    ['151.81.131.239'],
                    {
                        log: false,
                        message: (err, clientIp) => {
                            return 'ACCESS BLOCKED!'
                        }
                    }
                ))
                app.enable('trust proxy')

                return request(app)
                    .get('/')
                    .set('X-Forwarded-For', '151.81.131.400')
                    .expect('Content-Type', 'text/html; charset=utf-8')
                    .expect(401)
                    .then(res => {
                        expect(res.text).to.equal('ACCESS BLOCKED!')
                    })
            })

            it('Should return custom json message', () => {
                const app = createServer(ipAllowed(
                    ['151.81.131.239'],
                    {
                        log: false,
                        message: (err, clientIp) => {
                            return {
                                message: 'Dear client, you do not have permission to access the API :(',
                                description: 'Please search for the administrator.'
                            }
                        }
                    }
                ))
                app.enable('trust proxy')

                return request(app)
                    .get('/')
                    .set('X-Forwarded-For', '151.81.131.400')
                    .expect('Content-Type', 'application/json; charset=utf-8')
                    .expect(401)
                    .then(res => {
                        expect(res.body).to.have.property('message', 'Dear client, you do not have ' +
                            'permission to access the API :(')
                        expect(res.body).to.have.property('description', 'Please search for the administrator.')
                    })
            })
        })
    })

    describe('Print log', () => {
        it('Should print default log for allowed access', () => {
            let logDefault = ''
            const app = createServer(ipAllowed('151.81.131.239', {
                log: (clientIp, accessDenied) => {
                    logDefault = `Access ${accessDenied ? 'denied' : 'allowed'} for ip address ${clientIp}`
                }
            }))
            app.enable('trust proxy')

            return request(app)
                .get('/')
                .set('X-Forwarded-For', '151.81.131.239')
                .expect(200)
                .then(() => {
                    expect(logDefault).to.equal('Access allowed for ip address 151.81.131.239')
                })
        })

        it('Should print default log (no override) access allowed', () => {
            const app = createServer(ipAllowed('151.81.131.239'))
            app.enable('trust proxy')

            return request(app)
                .get('/')
                .set('X-Forwarded-For', '151.81.131.239')
                .expect(200)
        })

        it('Should print default log (no override) access denied', () => {
            const app = createServer(ipAllowed('151.81.131.239'))

            return request(app)
                .get('/')
                .expect(401)
        })

        it('Should return parameters clientIp and accessDenied on message callback', () => {
            let logDefault = ''
            const app = createServer(ipAllowed('127.0.0.1', {
                log: (clientIp, accessDenied) => {
                    logDefault = `Access ${accessDenied ? 'denied' : 'allowed'} for ip address ${clientIp}`
                }
            }))
            app.enable('trust proxy')

            return request(app)
                .get('/')
                .set('X-Forwarded-For', '151.81.131.239')
                .expect(401)
                .then(() => {
                    expect(logDefault).to.equal('Access denied for ip address 151.81.131.239')
                })
        })


        it('Should print custom log for allowed access', () => {
            let logDefault = ''
            const app = createServer(ipAllowed('*', {
                log: () => {
                    logDefault = 'Access allowed (0/'
                }
            }))

            return request(app)
                .get('/')
                .expect(200)
                .then(() => {
                    expect(logDefault).to.equal('Access allowed (0/')
                })
        })
    })

    describe('Status code', () => {
        it('Should return status code 500 for access denied', () => {
            const app = createServer(ipAllowed(['google.com'], {log: false, statusCode: '500'}))

            return request(app)
                .get('/')
                .expect(500)
        })


        it('Should return status code 301 for access denied', () => {
            const app = createServer(ipAllowed(['google.com'], {log: false, statusCode: 301}))

            return request(app)
                .get('/')
                .expect(301)
        })
    })

    describe('Redirect to', () => {
        it('Should return status code 301 and redirect to /access-denied', () => {
            const app = createServer(ipAllowed(
                ['google.com'], {
                    log: false,
                    statusCode: 301,
                    redirectTo: '/access-denied.html'
                }
            ))

            Object.defineProperty(app.request, 'ip', {
                configurable: true,
                enumerable: true,
                get: () => {
                }
            })

            return request(app)
                .get('/')
                .expect(301)
                .expect('Location', '/access-denied.html')
        })

        it('Should return status code default (401) and redirect to /access-denied', () => {
            const app = createServer(ipAllowed(
                ['151.81.131.400'], {
                    log: false,
                    redirectTo: '/access-denied.html'
                }
            ))

            return request(app)
                .get('/')
                .expect(401)
                .expect('Location', '/access-denied.html')
        })
    })
})

function createServer(middleware) {
    const app = express()
    app.use(middleware)
    app.get('/', (req, res) => res.send('IP ALLOWED!'))
    return app
}

