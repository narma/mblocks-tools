var jsdom = require('jsdom');
var fs = require('fs');
var path = require('path');

var DUMP_VERSION = '1.0'

function parse(html, callback_packet, callback_packets) {
    var jquery = fs.readFileSync("./jquery.js", 'utf-8');
    jsdom.env({
        html: html,
        //scripts: [jquery],
        src: [jquery],
        done: function(errors, window) {
            if(errors) {
                console.error('Err: ', errors);
                throw errors;
            }
            var $ = window.$ || window.jQuery;
            var packets = [];

            $("div#bodyContent .wikitable").each(function() {
                var table = $(this),
                    id = null,
                    txtId,
                    packet = {
                        fields: [],
                    };
                if(table.text().indexOf('Packet ID') < 0) return true; // not a packet
                var index_tr = 0;
                table.find('tr').each(function() {
                    var tr = $(this),
                        field = {};
                    // checks
                    var array_td = tr.find('td');
                    if(array_td.length < 4 || array_td.length > 5) {
                        return true;
                    }
                    var rowId = parseInt(tr.attr("class").substr(3));

                    if(rowId == 0) return true; // header

                    if(tr.attr("class") == 'row1' && !packet['id']) {
                        txtId = tr.find('td.col0').text().trim();
                        txtId = txtId.substr(0, 2) + txtId.substr(2).toUpperCase();
                        id = parseInt(txtId.substr(2), 16);
                        packet['id'] = id;
                    }
                    
                    packet['name'] = $('span.mw-headline[id*="' + txtId + '"]').text().replace('(' + txtId + ')', '').trim();
                    //if(!packet['id']) return true; // next
                    var index = 0;
                    tr.find('td').each(function() {
                        var td = $(this);

                        var colId = parseInt(td.attr("class").split(' ')[0].substr(3));

                        if(index_tr == 0 && (td.attr('rowspan') || (rowId == 1 && colId == 0))) return true; // id

                        val = td.text().trim();

                        if(0 == index) field['name'] = val;
                        if(1 == index) {
                            if(val == 'boolean') val = 'bool';
                            field['type'] = val;
                        }
                        if(2 == index) field['ex'] = val;
                        if(3 == index) field['notes'] = val;
                        index += 1; 
                    });
                    packet['fields'].push(field);
                    index_tr += 1;
                    
                });
                if(callback_packet) {
                    callback_packet(packet);
                } 
                if(callback_packets) {
                    packets.push(packet);
                }
            });
            if(callback_packets) callback_packets(packets);
        }
    });
}

function write_out(out) {
    return function(packets) {
        process.stdout.write("\n"); // after last stdout write in each_packet
        var data = {
            'dump_version': DUMP_VERSION,
            'packets': packets
        };
        var data_jsoned = JSON.stringify(data);
        fs.writeFile(out, data_jsoned, function (err) {
          if (err) throw err;          
        });
    }
}

function main() {
    var arguments = process.argv.splice(2);

    if(arguments.length < 1) {
      var script_name = path.basename(process.argv[1]);

      console.error("Usage: node " + script_name + " <file_or_url> [out=protocol.json]");
      console.error("Examppe: node " + script_name + "http://www.wiki.vg/Protocol");
      process.exit(1);
    }

    var html = arguments[0];
    var out = 'protocol.json'
    if(arguments.length > 1) {
        out = arguments[1];
    }

    function each_packet() {
        var counter = 0;
        return function() {
            counter += 1;
            if(counter > 1) process.stdout.write("\r");
            process.stdout.write("Parsed " + counter + " packets");
        }
    }

    parse(html, each_packet(), write_out(out));
}

if (require.main === module) {
    main();
}