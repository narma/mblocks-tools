exports.atomize = function(s) {
    s = s.toLowerCase().replace(/\s/g, '_').replace(/\//g, '_');
    s = (s.match(/[a-z_]/g) || []).join('');
    s = s.trim();
    if(!s) s = 'fixme_unknown';
    return s;
}
