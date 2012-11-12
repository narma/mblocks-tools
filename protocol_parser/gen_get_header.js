#!/usr/bin/node
var fs = require('fs');
var path = require('path');
var erlang = require('./erlang_syntax.js');
var DUMP_VERSION = '1.0'

function get_protocol(filename) {
    proto = JSON.parse(fs.readFileSync(filename, 'utf-8'));
    if(proto['dump_version'] != DUMP_VERSION) {
        console.error('Protocol mismatch, required ' + DUMP_VERSION + ' getted ' + proto['version']);
        process.exit(2);
    }
    return proto;
}

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
    var arguments = process.argv.splice(2);
    var filename = arguments[0] || 'protocol.json';

    if(!fs.existsSync(filename)) {
      var script_name = path.basename(process.argv[1]);
      console.error("File " + filename + " not exists")
      console.error("Usage: node " + script_name + " [protocol.json]");
      process.exit(1);
    }
    proto = get_protocol(filename);
    for(var i in proto['packets']) {
        var packet = proto['packets'][i];
        erlang_gen_get_header(packet);
    }
}

if (require.main === module) {
    main();
}