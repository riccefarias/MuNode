/**
 * Imports
 */
var native = require('./build/Release/munet.node');
var netpacket = require('netpacket');

/**
 * Constructor
 * @constructor
 */
function Encdec() {
}

/**
 * Gets the size of the packet
 * @param {Buffer} buffer
 */
Encdec.prototype.get_size = function(buffer) {
    return native.get_size(buffer);
};

/**
 * Gets the size of the packet (after encoding)
 * @param {Buffer} buffer
 */
Encdec.prototype.get_encoded_size = function(buffer) {
    return native.get_encoded_size(buffer);
};

/**
 * Gets the size of the packet (after decoding)
 * @param {Buffer} buffer
 */
Encdec.prototype.get_decoded_size = function(buffer) {
    return native.get_decoded_size(buffer);
};

/**
 * Gets the size of the packet
 * @param {Buffer} buffer
 */
Encdec.prototype.get_size = function(buffer) {
    return native.get_size(buffer);
};

/**
 * Gets the size of the packet
 * @param {Buffer} buffer
 * @param {Number} serial
 */
Encdec.prototype.client_encode = function(buffer, serial) {
    return native.client_encode(buffer, serial);
};

/**
 * Gets the size of the packet
 * @param {Buffer} buffer
 */
Encdec.prototype.client_decode = function(buffer) {
    return native.client_decode(buffer);
};

/**
 * Gets the size of the packet
 * @param {Buffer} buffer
 * @param {Number} serial
 */
Encdec.prototype.server_encode = function(buffer, serial) {
    return native.server_encode(buffer, serial);
};

/**
 * Gets the size of the packet
 * @param {Buffer} buffer
 */
Encdec.prototype.server_decode = function(buffer) {
    return native.server_decode(buffer);
};

module.exports.Methods = new Encdec();
module.exports.Packet = netpacket.Packet;
module.exports.PacketFactory = netpacket.PacketFactory;