declare const expressIpWhitelist: expressIpWhitelist.ExpressIpWhitelist
export = expressIpWhitelist

declare namespace expressIpWhitelist {
    interface ExpressIpWhitelist {
        (hostsAllowed: Array<string> | string, options?: Options): any;
    }

    interface Options {
        log?: Log | boolean
        message?: Message
    }

    interface Log {
        (clientIp: string, accessDenied: boolean): void
    }

    interface Message {
        (clientIp: string): object | string
    }
}
