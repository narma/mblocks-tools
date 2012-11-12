===================================
Parser tools for minecraft protocol
===================================

******
Parser
******
First of all, parse Minecraft protocol with ``parse_protocol.js`` which parse http://wiki.vg/Protocol page.
Usage:
 
``node parse_protocol.js http://www.wiki.vg/Protocol`` with url

``node parse_protocol.js Protocol`` with file.


This command generate ``protocol.json`` with packets data.

protocol.json format
====================
::

    { 
       'dump_version': '1.0',
       'packets': [packet, packet, ...]
    }
    packet: {
        fields: [field, field, ...],
        id: 2,
        name: 'Keep alive'
    }
    field: {
        "name":"Keep-alive ID",
        "type":"int",
        "ex":"957759560",
        "notes":"Server-generated random id"
    }


***************
Packet handlers
***************
This is template in node.js for custom packets handler:

::

    #!/usr/bin/node
    var erlang = require('./erlang_syntax.js');
    var proto = require('./proto_gen.js');
    var DUMP_VERSION = '1.0'

    function my_handler(packet) {
        var id = packet['id'];
        var fields = packet['fields'];
        var packet_name = packet['name'];

        for(var f in fields) {
            var field = fields[f];
            console.log(field['name'], erlang.atomize(field['type']));
        }
     }

    function main() {
         proto.require(DUMP_VERSION);
         proto.each_packet(my_handler);
    }

    if (require.main === module) {
        main();
    }
