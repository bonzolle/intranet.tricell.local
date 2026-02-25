var fs = require('fs');

function readHTML(htmlfile) {
  try {
    const htmltext = fs.readFileSync(htmlfile, 'utf-8')
    {
      return htmltext;
    }
  } catch (err) {
    console.error(err);
  }
  return htmltext;
}

module.exports = readHTML;