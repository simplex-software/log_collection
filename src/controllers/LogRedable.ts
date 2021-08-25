import path from "path";

const { Readable } = require('stream');
const fs = require('fs');

export default class LogReadable extends Readable {

  constructor(filepath: string, amount?: number) {
    super();
    this.fd = null;
    this.filepath = filepath;
    this.amountOfLogs = amount;
  }

  _construct(callback: (err?: any) => void) {
    fs.open(this.filepath, (err: any, fd: any) => {
      if (err) {
        callback(err);
      } else {
        this.fd = fd;
      }
    });
    fs.stat(this.filepath, (err: any, _stat: any) => {
      if (err) {
        callback(err);
      } else {
        this.position = _stat.size
        callback();
      }
    })
  }

  _read(n: any) {
    const buf = Buffer.alloc(n);
    const lenght = Math.min(this.position, n)
    this.position = this.position - lenght;

    fs.read(this.fd, buf, 0, n, this.position, async (err: any, bytesRead: number) => {
      if (err) {
        this.destroy(err);
      } else {
        const chunk = buf.slice(0, bytesRead).toString().split("\n");
        if (this.position > 0) {
          const rest = chunk.shift();
          this.position += rest ? rest.length : 0;
        }

        for (let line of chunk.reverse().filter((_, i) => i < this.amountOfLogs || !this.amountOfLogs ))
          this.push(`${line}\n`);
        this.amountOfLogs -= this.amountOfLogs > 0 ? chunk.length : 0;

        if (this.position === 0 || this.amountOfLogs <= 0) {
          this.push(null)
        }
      }
    });
  }

  _destroy(err: any, callback: (err: any) => void) {
    if (this.fd) {
      fs.close(this.fd, (er: any) => callback(er || err));
    } else {
      callback(err);
    }
  }
}