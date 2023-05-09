const axios = require("axios");
const cheerio = require("cheerio");
const Logger = require("./helpers/logger");

const DATA_DIR = "data";
const WIKI_API_URI = "https://pl.wikipedia.org/api/rest_v1";
const WIKI_HERBS_LIST_URI =
  "https://pl.wikipedia.org/wiki/Lista_ro%C5%9Blin_leczniczych";

(async () => {
  const wikiHerbsRes = await axios.get(WIKI_HERBS_LIST_URI);
  const $ = cheerio.load(wikiHerbsRes.data);
  const links = $(".mw-parser-output > ul > li > a");
  const linksKeys = Object.keys(links);
  const logger = new Logger(links.length);

  logger.log(`Found ${links.length} wiki links...`);
  logger.log("Starting scrapping procedure...");
  logger.log("");

  for (const prop in links) {
    const current = linksKeys.indexOf(prop);
    const hrefRegex = new RegExp("/wiki/*");
    const link = links[prop].attribs;

    if (hrefRegex.test(link?.href)) {
      const wikiPageUri = `${WIKI_API_URI}/page/html/${link.href.replace(
        "/wiki/",
        ""
      )}`;
    }
  }
})();
