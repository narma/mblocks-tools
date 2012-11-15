#!/usr/bin/node
var erlang = require('./lib/erlang_syntax.js');
var proto = require('./lib/proto_gen.js');

proto.optimist
        .boolean(['s', 'c', 't'])
        .alias('s', 'server')
        .alias('c', 'client')
        .alias('t', 'twoway')
        .describe('s', 'generate server-side packets')
        .describe('c', 'generate client-side packets')
        .describe('t', 'generate two-way side packets')
        ;

var argv = proto.optimist.argv;

var directions = [];

if(argv.s) directions.push('server_to_client');
if(argv.c) directions.push('client_to_server');
if(argv.t) directions.push('two_way');

var type_map = {
  'int': 'integer()',
  'long': 'integer()',
  'short': 'integer()',
  'byte': 'integer()',
  'float': 'float()',
  'double': 'float()',
  'bool': 'boolean()',
  'string': 'binary()'
}

function erlang_gen_packet_record(packet) {
  if(directions.indexOf(packet.direction) < 0) return;
    

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

      var erlang_type = undefined;
      if(type_map.hasOwnProperty(field_type)) {
        erlang_type = type_map[field_type];
      }
      var s = '';

      if(erlang_type) {
        s += ' ::' + erlang_type;
      }
      acc.push('  ' + field_name + s);
    }
    console.log(acc.join(',\n'));
    console.log('}).');
    console.log("\n");
}

if (require.main === module) {
    proto.each_packet(erlang_gen_packet_record);
}
