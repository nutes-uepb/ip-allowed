declare const ipAllowed: expressIpWhitelist.IpAllowed
export = ipAllowed

declare namespace expressIpWhitelist {
    interface IpAllowed {
        (allowedList: Array<string> | string, options?: Options): any;
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
