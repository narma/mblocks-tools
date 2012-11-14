#!/usr/bin/node
var erlang = require('./lib/erlang_syntax.js');
var proto = require('./lib/proto_gen.js');
var DUMP_VERSION = '1.0'

function erlang_gen_get_header(packet) {
    var id = packet['id'];
    var fields = packet['fields'];
    var packet_name = erlang.atomize(packet['name']);

    var acc = [];
    for(var f in fields) {
        var field = fields[f];
        var tt = erlang.atomize(field['type']);
        acc.push(tt)
    }
    console.log('get_header(' + id + ') -> {ok, ' + packet_name + ', [' + acc.join(', ') + ']};');
}

function main() {
    proto.require(DUMP_VERSION);
    proto.each_packet(erlang_gen_get_header);
}

if (require.main === module) {
    main();
}