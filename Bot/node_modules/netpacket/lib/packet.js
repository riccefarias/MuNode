/**
 * NetBuffer
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
var PacketFactory = require('./packetfactory.js');

/**
 * Imports
 */
var NetReader = netbuffer.NetReader;
var NetWriter = netbuffer.NetWriter;

/**
 * Constructor
 * @constructor
 */
function Packet() {

    /**
     * Constructor
     * @param {Packet} struct
     * @private
     */
    this._constructor = function(struct) {
        this._values = [];
    }

    /**
     * Static properties
     * @type {Array}
     * @private
     */
    this._constructor.prototype._writer = [];
    this._constructor.prototype._reader = [];

    /**
     * Parser
     * @param buffer
     */
    this._constructor.prototype.fromBuffer = function (buffer) {
        if (buffer.constructor.name === "Buffer" || buffer.constructor.name === "SlowBuffer") {
            buffer = buffer.toNetReader();
        }
        for (var step in this._reader) {
            buffer = this._reader[step].apply(this, [buffer]);
        }
        return buffer;
    };

    /**
     * Writer
     * @return Buffer
     */
    this._constructor.prototype.toBuffer = function () {
        var buffer = new NetWriter();
        for (var step in this._writer) {
            buffer = this._writer[step].apply(this, [buffer]);
        }
        return buffer.toBuffer();
    };
}

/**
 * Property register
 * @param name
 * @param isarray
 * @param isobj
 * @param ispacket
 * @param packetname
 */
Packet.prototype.property = function(name, isarray, isobj, ispacket, packetname) {
    Object.defineProperty(this._constructor.prototype, name, {
        get: function() {
            if (!(name in this._values)) {
                if (ispacket) {
                    this._values[name] = PacketFactory.create(packetname);
                } else if (isarray) {
                    this._values[name] = [];
                } else if (isobj) {
                    this._values[name] = {};
                } else {
                    this._values[name] = null;
                 }
            }
            return this._values[name];
        },
        set: function(val) {
            if (isarray) {
                if (val.constructor.name !== "Array") {
                    throw new Error("Value must be an array.");
                }
            } else if (isobj) {
                if (typeof val !== "object") {
                    throw new Error("Value must be an object.");
                }
            }
            this._values[name] = val;
        }
    });
};

/**
 * Factory
 * @return Object
 */
Packet.prototype.create = function() {
    return new this._constructor(this);
};

/**
 * Int8
 * @returns {Packet}
 */
Packet.prototype.int8 = function(name, unsigned, def) {

    this.property(name, false, false, false, null);

    var read_method = unsigned ? NetReader.prototype.readUInt8 : NetReader.prototype.readInt8;
    this._constructor.prototype._reader.push(function(buffer) {
        this._values[name] = read_method.apply(buffer);
        return buffer;
    });

    var write_method = unsigned ? NetWriter.prototype.writeUInt8 : NetWriter.prototype.writeInt8;
    this._constructor.prototype._writer.push(function(buffer) {
        if (!(name in this._values)) {
            write_method.apply(buffer, [def]);
        } else {
            write_method.apply(buffer, [this._values[name]]);
        }
        return buffer;
    });

    return this;
};

/**
 * Int8 array
 * @returns {Packet}
 */
Packet.prototype.int8_array = function(name, unsigned, size, def) {

    this.property(name, true, false, false, null);

    var read_method = unsigned ? NetReader.prototype.readUInt8 : NetReader.prototype.readInt8;
    this._constructor.prototype._reader.push(function(buffer) {
        var s = 0;
        if (size.constructor.name === "String" || size instanceof String) {
            if (!(size in this._values)) {
                throw new Error("Size property value missing (" + size + ")");
            }
            s = this._values[size];
        } else {
            s = size;
        }
        var arr = [];
        for (var i = 0; i < s; i++) {
            arr.push(read_method.apply(buffer));
        }
        this._values[name] = arr;
        return buffer;
    });

    var write_method = unsigned ? NetWriter.prototype.writeUInt8 : NetWriter.prototype.writeInt8;
    this._constructor.prototype._writer.push(function(buffer) {
        var s = 0;
        if (size.constructor.name === "String" || size instanceof String) {
            if (!(size in this._values)) {
                throw new Error("Size property value missing (" + size + ")");
            }
            s = this._values[size];
        } else {
            s = size;
        }
        var vals = (name in this._values ? this._values[name] : []);
        for (var i = 0; i < s; i++) {
            write_method.apply(buffer, [i >= vals.length ? def : vals[i]]);
        }
        return buffer;
    });

    return this;
};

/**
 * Int16
 * @returns {Packet}
 */
Packet.prototype.int16 = function(name, unsigned, def, bigendian) {

    bigendian = (typeof bigendian !== "undefined" ? bigendian : true);

    this.property(name, false, false, false, null);

    var read_method = unsigned ?
        (bigendian ? NetReader.prototype.readUInt16BE : NetReader.prototype.readUInt16LE) :
        (bigendian ? NetReader.prototype.readInt16BE : NetReader.prototype.readInt16LE);
    this._constructor.prototype._reader.push(function(buffer) {
        this._values[name] = read_method.apply(buffer);
        return buffer;
    });

    var write_method = unsigned ?
        (bigendian ? NetWriter.prototype.writeUInt16BE : NetWriter.prototype.writeUInt16LE) :
        (bigendian ? NetWriter.prototype.writeInt16BE : NetWriter.prototype.writeInt16LE);
    this._constructor.prototype._writer.push(function(buffer) {
        if (!(name in this._values)) {
            write_method.apply(buffer, [def]);
        } else {
            write_method.apply(buffer, [this._values[name]]);
        }
        return buffer;
    });

    return this;
};

/**
 * Int16 array
 * @returns {Packet}
 */
Packet.prototype.int16_array = function(name, unsigned, size, def, bigendian) {

    bigendian = (typeof bigendian !== "undefined" ? bigendian : true);

    this.property(name, true, false, false);

    var read_method = unsigned ?
        (bigendian ? NetReader.prototype.readUInt16BE : NetReader.prototype.readUInt16LE) :
        (bigendian ? NetReader.prototype.readInt16BE : NetReader.prototype.readInt16LE);
    this._constructor.prototype._reader.push(function(buffer) {
        var s = 0;
        if (size.constructor.name === "String" || size instanceof String) {
            if (!(size in this._values)) {
                throw new Error("Size property value missing (" + size + ")");
            }
            s = this._values[size];
        } else {
            s = size;
        }
        var arr = [];
        for (var i = 0; i < s; i++) {
            arr.push(read_method.apply(buffer));
        }
        this._values[name] = arr;
        return buffer;
    });

    var write_method = unsigned ?
        (bigendian ? NetWriter.prototype.writeUInt16BE : NetWriter.prototype.writeUInt16LE) :
        (bigendian ? NetWriter.prototype.writeInt16BE : NetWriter.prototype.writeInt16LE);
    this._constructor.prototype._writer.push(function(buffer) {
        var s = 0;
        if (size.constructor.name === "String" || size instanceof String) {
            if (!(size in this._values)) {
                throw new Error("Size property value missing (" + size + ")");
            }
            s = this._values[size];
        } else {
            s = size;
        }
        var vals = (name in this._values ? this._values[name] : []);
        for (var i = 0; i < s; i++) {
            write_method.apply(buffer, [i >= vals.length ? def : vals[i]]);
        }
        return buffer;
    });

    return this;
};

/**
 * Int32
 * @returns {Packet}
 */
Packet.prototype.int32 = function(name, unsigned, def, bigendian) {

    bigendian = (typeof bigendian !== "undefined" ? bigendian : true);

    this.property(name, false, false, false, null);

    var read_method = unsigned ?
        (bigendian ? NetReader.prototype.readUInt32BE : NetReader.prototype.readUInt32LE) :
        (bigendian ? NetReader.prototype.readInt32BE : NetReader.prototype.readInt32LE);
    this._constructor.prototype._reader.push(function(buffer) {
        this._values[name] = read_method.apply(buffer);
        return buffer;
    });

    var write_method = unsigned ?
        (bigendian ? NetWriter.prototype.writeUInt32BE : NetWriter.prototype.writeUInt32LE) :
        (bigendian ? NetWriter.prototype.writeInt32BE : NetWriter.prototype.writeInt32LE);
    this._constructor.prototype._writer.push(function(buffer) {
        if (!(name in this._values)) {
            write_method.apply(buffer, [def]);
        } else {
            write_method.apply(buffer, [this._values[name]]);
        }
        return buffer;
    });

    return this;
};

/**
 * Int32 array
 * @returns {Packet}
 */
Packet.prototype.int32_array = function(name, unsigned, size, def, bigendian) {

    bigendian = (typeof bigendian !== "undefined" ? bigendian : true);

    this.property(name, true, false, false, null);

    var read_method = unsigned ?
        (bigendian ? NetReader.prototype.readUInt32BE : NetReader.prototype.readUInt32LE) :
        (bigendian ? NetReader.prototype.readInt32BE : NetReader.prototype.readInt32LE);
    this._constructor.prototype._reader.push(function(buffer) {
        var s = 0;
        if (size.constructor.name === "String" || size instanceof String) {
            if (!(size in this._values)) {
                throw new Error("Size property value missing (" + size + ")");
            }
            s = this._values[size];
        } else {
            s = size;
        }
        var arr = [];
        for (var i = 0; i < s; i++) {
            arr.push(read_method.apply(buffer));
        }
        this._values[name] = arr;
        return buffer;
    });

    var write_method = unsigned ?
        (bigendian ? NetWriter.prototype.writeUInt32BE : NetWriter.prototype.writeUInt32LE) :
        (bigendian ? NetWriter.prototype.writeInt32BE : NetWriter.prototype.writeInt32LE);
    this._constructor.prototype._writer.push(function(buffer) {
        var s = 0;
        if (size.constructor.name === "String" || size instanceof String) {
            if (!(size in this._values)) {
                throw new Error("Size property value missing (" + size + ")");
            }
            s = this._values[size];
        } else {
            s = size;
        }
        var vals = (name in this._values ? this._values[name] : []);
        for (var i = 0; i < s; i++) {
            write_method.apply(buffer, [i >= vals.length ? def : vals[i]]);
        }
        return buffer;
    });

    return this;
};

/**
 * Float
 * @returns {Packet}
 */
Packet.prototype.float = function(name, def, bigendian) {

    bigendian = (typeof bigendian !== "undefined" ? bigendian : true);

    this.property(name, false, false, false, null);

    var read_method = (bigendian ? NetReader.prototype.readFloatBE : NetReader.prototype.readFloatLE);
    this._constructor.prototype._reader.push(function(buffer) {
        this._values[name] = read_method.apply(buffer);
        return buffer;
    });

    var write_method = (bigendian ? NetWriter.prototype.writeFloatBE : NetWriter.prototype.writeFloatLE);
    this._constructor.prototype._writer.push(function(buffer) {
        if (!(name in this._values)) {
            write_method.apply(buffer, [def]);
        } else {
            write_method.apply(buffer, [this._values[name]]);
        }
        return buffer;
    });

    return this;
};

/**
 * Float array
 * @returns {Packet}
 */
Packet.prototype.float_array = function(name, unsigned, size, def, bigendian) {

    bigendian = (typeof bigendian !== "undefined" ? bigendian : true);

    this.property(name, true, false, false, null);

    var read_method = (bigendian ? NetReader.prototype.readFloatBE : NetReader.prototype.readFloatLE);
    this._constructor.prototype._reader.push(function(buffer) {
        var s = 0;
        if (size.constructor.name === "String" || size instanceof String) {
            if (!(size in this._values)) {
                throw new Error("Size property value missing (" + size + ")");
            }
            s = this._values[size];
        } else {
            s = size;
        }
        var arr = [];
        for (var i = 0; i < s; i++) {
            arr.push(read_method.apply(buffer));
        }
        this._values[name] = arr;
        return buffer;
    });

    var write_method = (bigendian ? NetWriter.prototype.writeFloatBE : NetWriter.prototype.writeFloatLE);
    this._constructor.prototype._writer.push(function(buffer) {
        var s = 0;
        if (size.constructor.name === "String" || size instanceof String) {
            if (!(size in this._values)) {
                throw new Error("Size property value missing (" + size + ")");
            }
            s = this._values[size];
        } else {
            s = size;
        }
        var vals = (name in this._values ? this._values[name] : []);
        for (var i = 0; i < s; i++) {
            write_method.apply(buffer, [i >= vals.length ? def : vals[i]]);
        }
        return buffer;
    });

    return this;
};

/**
 * Double
 * @returns {Packet}
 */
Packet.prototype.double = function(name, def, bigendian) {

    bigendian = (typeof bigendian !== "undefined" ? bigendian : true);

    this.property(name, false, false, false, null);

    var read_method = (bigendian ? NetReader.prototype.readDoubleBE : NetReader.prototype.readDoubleLE);
    this._constructor.prototype._reader.push(function(buffer) {
        this._values[name] = read_method.apply(buffer);
        return buffer;
    });

    var write_method = (bigendian ? NetWriter.prototype.writeDoubleBE : NetWriter.prototype.writeDoubleLE);
    this._constructor.prototype._writer.push(function(buffer) {
        if (!(name in this._values)) {
            write_method.apply(buffer, [def]);
        } else {
            write_method.apply(buffer, [this._values[name]]);
        }
        return buffer;
    });

    return this;
};

/**
 * Double array
 * @returns {Packet}
 */
Packet.prototype.double_array = function(name, unsigned, size, def, bigendian) {

    bigendian = (typeof bigendian !== "undefined" ? bigendian : true);

    this.property(name, true, false, false, null);

    var read_method = (bigendian ? NetReader.prototype.readDoubleBE : NetReader.prototype.readDoubleLE);
    this._constructor.prototype._reader.push(function(buffer) {
        var s = 0;
        if (size.constructor.name === "String" || size instanceof String) {
            if (!(size in this._values)) {
                throw new Error("Size property value missing (" + size + ")");
            }
            s = this._values[size];
        } else {
            s = size;
        }
        var arr = [];
        for (var i = 0; i < s; i++) {
            arr.push(read_method.apply(buffer));
        }
        this._values[name] = arr;
        return buffer;
    });

    var write_method = (bigendian ? NetWriter.prototype.writeDoubleBE : NetWriter.prototype.writeDoubleLE);
    this._constructor.prototype._writer.push(function(buffer) {
        var s = 0;
        if (size.constructor.name === "String" || size instanceof String) {
            if (!(size in this._values)) {
                throw new Error("Size property value missing (" + size + ")");
            }
            s = this._values[size];
        } else {
            s = size;
        }
        var vals = (name in this._values ? this._values[name] : []);
        for (var i = 0; i < s; i++) {
            write_method.apply(buffer, [i >= vals.length ? def : vals[i]]);
        }
        return buffer;
    });

    return this;
};

/**
 * String
 * @returns {Packet}
 */
Packet.prototype.string = function(name, size, def) {

    def = def || "";
    this.property(name, false, false, false, null);

    var read_method = (size === null ? NetReader.prototype.readNtString : NetReader.prototype.readFixedString);
    this._constructor.prototype._reader.push(function(buffer) {
        this._values[name] = read_method.apply(buffer, [size]);
        return buffer;
    });

    var write_method = (size === null ? NetWriter.prototype.writeNtString : NetWriter.prototype.writeFixedString);
    this._constructor.prototype._writer.push(function(buffer) {
        if (!(name in this._values)) {
            write_method.apply(buffer, [def, size]);
        } else {
            write_method.apply(buffer, [this._values[name], size]);
        }
        return buffer;
    });

    return this;
};

/**
 * Packet
 * @returns {Packet}
 */
Packet.prototype.packet = function(name, packet) {

    this.property(name, false, false, true, packet);

    this._constructor.prototype._reader.push(function(buffer) {
        var pkt = PacketFactory.create(packet);
        buffer = pkt.fromBuffer(buffer);
        this._values[name] = pkt;
        return buffer;
    });

    this._constructor.prototype._writer.push(function(buffer) {
        var obj = null;
        if (!(name in this._values)) {
            obj = PacketFactory.create(packet);
        } else {
            obj = this._values[name];
        }
        buffer.writeBuffer(obj.toBuffer());
        return buffer;
    });

    return this;
};

/**
 * Double array
 * @returns {Packet}
 */
Packet.prototype.packet_array = function(name, packet, size) {

    this.property(name, true, false, true, packet);

    this._constructor.prototype._reader.push(function(buffer) {
        var s = 0;
        if (size.constructor.name === "String" || size instanceof String) {
            if (!(size in this._values)) {
                throw new Error("Size property value missing (" + size + ")");
            }
            s = this._values[size];
        } else {
            s = size;
        }
        var arr = [];
        for (var i = 0; i < s; i++) {
            var entry = PacketFactory.create(packet);
            buffer = entry.fromBuffer(buffer);
            arr.push(entry);
        }
        this._values[name] = arr;
        return buffer;
    });

    this._constructor.prototype._writer.push(function(buffer) {
        var s = 0;
        if (size.constructor.name === "String" || size instanceof String) {
            if (!(size in this._values)) {
                throw new Error("Size property value missing (" + size + ")");
            }
            s = this._values[size];
        } else {
            s = size;
        }
        var vals = (name in this._values ? this._values[name] : []);
        for (var i = 0; i < s; i++) {
            var obj = null;
            if (i >= vals.length) {
                obj = PacketFactory.create(packet);
            } else {
                obj = vals[i];
            }
            buffer.writeBuffer(obj.toBuffer());
        }
        return buffer;
    });

    return this;
};

/**
 * Exports
 * @type {Packet}
 */
module.exports = Packet;

