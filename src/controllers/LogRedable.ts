import path from "path";
import { Readable } from 'stream';
import { FileHandle, FileReadResult, open, stat } from 'fs/promises';

export default class LogReadable extends Readable {
  private _fd?: FileHandle;
  private _filepath: string;
  private _eventLimits: number;
  private _position: number;

  constructor(filepath: string, amount: number) {
    super();
    this._filepath = filepath;
    this._eventLimits = amount;
    this._position = 0;
  }

  async _construct(callback: (err?: any) => void) {
    try {
      this._fd = await open(this._filepath, "r");
      this._position = (await stat(this._filepath, {})).size;
    } catch (e) {
      this.destroy(e)
    }
  }

  async _read(n: any) {
    try {
      const chunk = await this.fetchAChunk(n);
      for (let event of this.parseLogEvents(chunk)) {
        this.pushEvent(event);
      }

      if (this.hasFinish())
        this.push(null)
    } catch (e) {
      this.destroy(e)
    }
  }

  _destroy(err: any, callback: (err: any) => void) {
    this._fd?.close();
    callback(err);
  }

  private async fetchAChunk(n: number): Promise<string> {
    let chunk: string = "";
    let length: number = 0;

    while (!this.hasCompleteLogs(chunk)) {
      length = Math.min(this._position, n);
      this._position -= length;
      const buffer = Buffer.alloc(length)

      const results = await this._fd?.read({ buffer, offset: 0, length, position: this._position })
      chunk = buffer.slice(0, results?.bytesRead).toString().concat(chunk);
    }

    if (this._position === 0) return chunk;

    const indexAfterJump = chunk.indexOf("\n");
    this._position -= indexAfterJump;
    return chunk.substr(indexAfterJump + 1);
  }

  private pushEvent(event: string): boolean {
    if (this._eventLimits == 0) return false;

    this.push(event)
    this.decreaseLimit()
    return true;
  }

  private decreaseLimit() {
    if (this._eventLimits !== undefined) {
      this._eventLimits -= this._eventLimits;
    }
  }

  private hasCompleteLogs(chunk: string): boolean {
    return chunk.includes('\n') || this._position === 0
  }

  private hasFinish(): boolean {
    return this._position === 0 || this._eventLimits <= 0
  }

  private parseLogEvents(chunk: string): string[] {
    return chunk.split("\n").join("\n\f").split("\f").reverse();
  }
}