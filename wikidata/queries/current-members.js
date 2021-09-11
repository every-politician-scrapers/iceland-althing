const fs = require('fs');
let rawmeta = fs.readFileSync('meta.json');
let meta = JSON.parse(rawmeta);

module.exports = function () {
  return `SELECT ?item ?name ?party ?group ?district ?constituency ?gender ?dob ?dobPrecision
         (STRAFTER(STR(?statement), '/statement/') AS ?psid)
    WHERE
    {
      ?item p:P39 ?statement .
      ?statement ps:P39 wd:${meta.legislature.member} .
      FILTER NOT EXISTS { ?statement pq:P582 ?end }

      OPTIONAL {
        ?statement pq:P4100 ?party .
        OPTIONAL { ?party wdt:P1813 ?partyShort FILTER (LANG(?partyShort) = '${meta.source.lang.code}')}
        OPTIONAL { ?party rdfs:label ?partyName FILTER (LANG(?partyName) = '${meta.source.lang.code}')}
        BIND(COALESCE(?partyShort, ?partyName) as ?group)
      }

      OPTIONAL {
        ?statement pq:P768 ?district .
      }

      OPTIONAL {
        ?statement prov:wasDerivedFrom ?ref .
        ?ref pr:P854 ?source FILTER CONTAINS(STR(?source), '${meta.source.url}')
        OPTIONAL { ?ref pr:P1810 ?sourceName }
      }
      OPTIONAL { ?item rdfs:label ?wdLabel FILTER(LANG(?wdLabel) = "${meta.source.lang.code}") }
      BIND(COALESCE(?sourceName, ?wdLabel) AS ?name)

      OPTIONAL { ?item wdt:P21 ?genderItem }
      OPTIONAL { # truthiest DOB, with precison
        ?item p:P569 ?ts .
        ?ts a wikibase:BestRank .
        ?ts psv:P569 [wikibase:timeValue ?dob ; wikibase:timePrecision ?dobPrecision] .
      }
      SERVICE wikibase:label {
        bd:serviceParam wikibase:language "en".
        ?genderItem rdfs:label ?gender .
        ?district rdfs:label ?constituency .
      }
    }
    # ${new Date().toISOString()}
    ORDER BY ?item`
}
