#!/usr/bin/node
var erlang = require('./lib/erlang_syntax.js');
var proto = require('./lib/proto_gen.js');

function erlang_gen_packet_record(packet) {
    var id = packet['id'];
    var fields = packet['fields'];
    var packet_name = erlang.atomize(packet['name']);

    var descs = packet['description'];
    for(var i in descs) {
      var desc = descs[i];
      var dd = desc.split("\n");
      for(var j in dd) {
        var d = dd[j];
        console.log('%%%%', d);
      }
      console.log();
    }

    console.log('-record(pkt_' + packet_name + ', {');

    var acc = [];
    for(var f in fields) {
      var field = fields[f];
      var field_type = erlang.atomize(field['type']);
      var field_name = erlang.atomize(field['name']);
      acc.push('  ' + field_name);
    }
    console.log(acc.join(',\n'));
    console.log('}).');
    console.log("\n");
}

if (require.main === module) {
    proto.each_packet(erlang_gen_packet_record);
}
