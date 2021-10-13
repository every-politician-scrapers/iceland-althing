const fs = require('fs');
let rawmeta = fs.readFileSync('meta.json');
let meta = JSON.parse(rawmeta);

module.exports = function () {
  return `SELECT ?person ?name ?group ?groupLabel ?district ?districtLabel
         (STRAFTER(STR(?statement), '/statement/') AS ?psid)
    WHERE
    {
      ?person wdt:P31 wd:Q5 ; p:P39 ?statement .
      ?statement ps:P39 wd:Q108856016 .
      FILTER NOT EXISTS { ?statement pq:P582 ?end }

      OPTIONAL { ?statement pq:P4100 ?group }
      OPTIONAL { ?statement pq:P768 ?district }

      OPTIONAL {
        ?statement prov:wasDerivedFrom ?ref .
        ?ref pr:P143 wd:Q718394 . # Icelandic Wikipedia
        OPTIONAL { ?ref pr:P1810 ?sourceName }
      }
      OPTIONAL { ?person rdfs:label ?wdLabel FILTER(LANG(?wdLabel) = "en") }
      BIND(COALESCE(?sourceName, ?wdLabel) AS ?name)

      SERVICE wikibase:label { bd:serviceParam wikibase:language "is"  }
    }
    # ${new Date().toISOString()}
    ORDER BY ?person`
}
