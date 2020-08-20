Netpacket
========
Netpacket is a helper library to write/read binary structures in node.

Instalaltion
-----

	npm install netpacket

Usage
-----

###Import the library

    var netpacket = require('../modules/netpacket');
    var PacketFactory = netpacket.PacketFactory;
    var Packet = netpacket.Packet;
    
###Define your packets

    PacketFactory.define('TestPacket', new Packet()
        .int8('my_int8', true)
        .int16('my_int16', true)
        .int32('my_int32', true)
        .float('my_float')
        .double('my_double')
        .string('my_string', 15)
    );
    
###Create a packet instance
    
    var pktw = PacketFactory.create('TestPacket');
    
###Set the packet contents
    
    pktw.my_int8 = 1;
    pktw.my_int16 = 2;
    pktw.my_int32 = 3;
    pktw.my_float = 4.0;
    pktw.my_double = 5.0;
    pktw.my_string = 'Hello World';
    
###Convert packet to a buffer

    var buff = pktw.toBuffer();
    console.log(buff);
    
    // Output: 
    //<Buffer 01 00 02 00 00 00 03 40 80 00 00 40 14 00 00 00 00 00 00 48 65 6c 6c 6f 20 57 6f 72 6c 64 00 00 00 00>
    //        I8 I16.. I32........ FLOAT...... DOUBLE................. STRING(15)..................................
    
###Parse packet from a buffer
    
    var pktr = buff.toPacket('TestPacket');
    console.log
    (
        pktr.my_int8,
        pktr.my_int16,
        pktr.my_int32,
        pktr.my_float,
        pktr.my_double,
        pktr.my_string
    );
    
    // Output: 1 2 3 4 5 'Hello World'

Notes
-----

1.  You can specify parameter's endianess for int16, in32, double and float.
2.  You can specify parameter's default value.
3.  You can specify inner packets with

    .packet(name, 'PacketName')

4. You can set array parameters with 
    - int8_array
    - int16_array
    - int32_array 
    - float_arrat 
    - double_array
    - packet_array
5. Size parameter in _array functions can be a string (which will point to another property value when parsing - not writing)
