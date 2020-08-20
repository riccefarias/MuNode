var netpacket = require('./index.js');
var PacketFactory = netpacket.PacketFactory;
var Packet = netpacket.Packet;

PacketFactory.define('TestPacket2', new Packet()
    .int8('my_int8', true)
    .int16('my_int16', true)
    .int32('my_int32', true)
    .float('my_float')
    .double('my_double')
    .string('my_string', 15)
);

var pktw = PacketFactory.create('TestPacket2');

pktw.my_int8 = 1;
pktw.my_int16 = 2;
pktw.my_int32 = 3;
pktw.my_float = 4.0;
pktw.my_double = 5.0;
pktw.my_string = 'Hello World';

var buff = pktw.toBuffer();
console.log(buff);

var pktr = buff.toPacket('TestPacket2');
console.log(
    pktr.my_int8,
    pktr.my_int16,
    pktr.my_int32,
    pktr.my_float,
    pktr.my_double,
    pktr.my_string
);
