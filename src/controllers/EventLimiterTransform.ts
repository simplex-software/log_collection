import { Transform } from "stream";

export default class EventLimiter extends Transform {
    private _amount?: number;

    constructor(amount?: string) {
        super({ readableObjectMode: true })
        this._amount = amount ? parseInt("" + amount) : undefined;
    }

    _transform(chunk: Buffer, encoding: string, callback: () => void) {
        if (this._amount === undefined) {
            this.push(chunk)
        } else if (this._amount > 0) {
            this.push(chunk)
            this._amount--
        } else {
            this.push(null)
        }

        callback();
    }

}