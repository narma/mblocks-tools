var jsdom = require('jsdom');

function parse(html, callback) {
    jsdom.env({
        html: html,
        scripts: ["jquery.js"],
        done: function(errors, window) {
            if(errors) {
                console.error('Err: ', errors);
            }
            var $ = window.$;

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
                callback(packet);
            });
        }
    });
}

function print_out(packet) {
//    console.log(packet);
    var id = packet['id'];
    if(!id || id.substr(0, 2) != '0x' || parseInt(id.substr(2), 16) == NaN) {
        console.error('Bad packet', packet);
        return ;
    }
    console.log(id, packet['name']);
    for(var f in packet['fields']) {
        var field = packet['fields'][f];
        console.log(field['type'], '"' + field['name'] + '"');
/*        if(!field['type'] || !field['name']) {
            console.error('Bad field:', field);
        }*/
    }
    console.log("\n");

}

function atomize(s) {
    s = s.toLowerCase().replace(/\s/g, '_').replace(/\//g, '_');
    s = (s.match(/[a-z_]/g) || []).join('');
    s = s.trim();
    if(!s) s = 'fixme_unknown';
    return s;
}
function erlang_gen_get_header(packet) {
    var id = packet['id'];
    var fields = packet['fields'];
    var packet_name = atomize(packet['name']);

    var acc = [];
    for(var f in fields) {
        var field = fields[f];
        var tt = atomize(field['type']);
        acc.push(tt)
    }
    console.log('get_header(' + id + ') -> {ok, ' + packet_name + ', [' + acc.join(', ') + ']};');
}

parse('Protocol', erlang_gen_get_header);
