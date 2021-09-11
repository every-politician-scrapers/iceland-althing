const fs = require('fs');

let rawmeta = fs.readFileSync('meta.json');
let meta = JSON.parse(rawmeta);

module.exports = (guid, name) => ({
    guid,
    snaks: {
      P854: meta.source.url,
      P1476: {
        text: meta.source.title,
        language: meta.source.lang.code,
      },
      P813: new Date().toISOString().split('T')[0],
      P407: meta.source.lang.wikidata,
      P1810: name, // named as (Person)
    }
})
