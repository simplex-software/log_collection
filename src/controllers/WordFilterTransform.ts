import { Transform } from "stream";

export default class WordFilter extends Transform {
    private _filterWord: string;

    constructor(filterWord: string) {
        super({ readableObjectMode: true })
        this._filterWord = filterWord
    }

    _transform(chunk: Buffer, encoding: string, callback: () => void) {
        if (chunk.toString().includes(this._filterWord))
            this.push(chunk);
        callback();
    }
}