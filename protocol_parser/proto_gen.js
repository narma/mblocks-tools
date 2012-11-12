var fs = require('fs');
var path = require('path');

var optimist = require('optimist')
    .usage('Generator from minecraft protocol.\nUsage: $0 -p <protocol.json>')
    .demand('p')
    .default('p', 'protocol.json')
    .describe('p', 'Filename, protocol dumped into json by parse_protocol.js')
    ;
 
var argv = optimist.argv;
var required_dump_version = undefined;

function get_protocol(filename) {
    proto = JSON.parse(fs.readFileSync(filename, 'utf-8'));
    if(!required_dump_version) {
    	console.error("Must call proto.require(dump_version) before call this");
    	console.trace();
    	process.exit(3)
    }

    if(proto['dump_version'] != required_dump_version) {
        console.error('Dump protocol mismatch, required ' + required_dump_version + ' getted ' + proto['dump_version']);
        process.exit(2);
    }
    return proto;
}


exports.require = function(dump_version) {
	required_dump_version = dump_version;
}
exports.each_packet = function(callback) {
    var proto_filename = argv.p;

    if(!fs.existsSync(proto_filename)) {
      console.log(optimist.help());
      process.exit(1);
    }
    proto = get_protocol(proto_filename);
    for(var i in proto['packets']) {
        var packet = proto['packets'][i];
        callback(packet);
    }
}
