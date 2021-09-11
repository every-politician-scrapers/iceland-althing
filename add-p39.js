const fs = require('fs');
let rawmeta = fs.readFileSync('meta.json');
let meta = JSON.parse(rawmeta);

module.exports = (id, party, district, startdate, enddate) => {
  qualifier = {
    P2937: meta.legislature.term.id,
  }

  if(startdate)    qualifier['P580']  = startdate
  if(party)        qualifier['P4100'] = party
  if(district)     qualifier['P768'] =  district
  if(enddate)      qualifier['P582']  = enddate

  return {
    id,
    claims: {
      P39: {
        value: meta.legislature.member,
        qualifiers: qualifier,
      }
    }
  }
}
