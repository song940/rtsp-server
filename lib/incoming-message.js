const nextLine = require('next-line');
const httpHeaders = require('http-headers');
const requestLine = require('./request-line');
const statusLine = require('./status-line');
const { PassThrough } = require('readable-stream');

const STATUS_LINE_START = Buffer.from('RTSP/1.0');

function isResponse(head) {
  for (var i = 0; i < 8; i++) {
    if (STATUS_LINE_START[i] !== head[i]) return false
  }
  return true
}

class IncomingMessage extends PassThrough {
  constructor(head, opts) {
    super(opts);
    if (typeof head === 'string') head = Buffer.from(head)
    var line = nextLine(head)()
    if (isResponse(head)) {
      line = statusLine.parse(line)
      this.statusCode = line.statusCode
      this.statusMessage = line.statusMessage
    } else {
      line = requestLine.parse(line)
      this.method = line.method
      this.uri = line.uri
    }
    this.rtspVersion = line.rtspVersion
    this.headers = httpHeaders(head)
  }
}

module.exports = IncomingMessage;
