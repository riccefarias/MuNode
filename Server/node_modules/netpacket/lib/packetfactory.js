/**
 *
 * Copyright (C) 2012 João Francisco Biondo Trinca
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 *
 * @author     João Francisco Biondo Trinca <wolfulus@gmail.com>
 * @copyright  2012 João Francisco Biondo Trinca <wolfulus@gmail.com>
 * @license    http://www.opensource.org/licenses/mit-license.html  MIT License
 *
 */

var netbuffer = require('netbuffer');
var Packet = require('./packet.js');

/**
 * NetBuffer classes
 */
var Buffer = require('buffer').Buffer;
var SlowBuffer = require('buffer').SlowBuffer;

/**
 * PacketFactory
 * @constructor
 */
function PacketFactory() {
    /**
     *
     * @type {Array.Packet}
     * @private
     */
    this._packets = [];
}

/**
 * Defines a packet
 * @param {String} name
 * @param {Packet} packet
 */
PacketFactory.prototype.define = function(name, packet) {
    this._packets[name] = packet;
};

/**
 * Factory
 * @param {String} name
 */
PacketFactory.prototype.create = function(name) {
    if (!(name in this._packets)) {
        throw new Error("Undefined packet '" + name + "'");
    } else {
        return this._packets[name].create();
    }
};

/**
 * Exports
 * @type {PacketFactory}
 */
var pkts = new PacketFactory();
module.exports = pkts;

/**
 * Converts the current buffer to a packet class
 * @param {String} name
 * @return {Packet}
 */
Buffer.prototype.toPacket = function (name) {
    var pkt = pkts.create(name);
    pkt.fromBuffer(this);
    return pkt;
};

/**
 * Converts the current buffer to a packet class
 */
SlowBuffer.prototype.toPacket = function (name) {
    var pkt = pkts.create(name);
    pkt.fromBuffer(this);
    return pkt;
};
