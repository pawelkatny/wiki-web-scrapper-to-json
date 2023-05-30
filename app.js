const axios = require("axios");
const cheerio = require("cheerio");
const Logger = require("./helpers/logger");
const fs = require("fs");
const path = require("path");

const DATA_DIR = "data";
const WIKI_API_URI = "https://pl.wikipedia.org/wiki";
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
  let counter = 0;
  for (const prop in links) {
    const current = linksKeys.indexOf(prop);
    const hrefRegex = new RegExp("/wiki/*");
    const link = links[prop].attribs;

    if (hrefRegex.test(link?.href)) {
      if (counter >= 1) return;
      counter++;
      logger.showProgress(current + 1);
      logger.log(`Loading HTML content for WIKI page: "${link.title}"`);
      const wikiPageUri = `${WIKI_API_URI}/${link.href.replace("/wiki/", "")}`;

      const pageHTML = await axios.get(wikiPageUri);

      const $ = cheerio.load(pageHTML.data);

      let parsedData = {
        title: link.title,
        pageHeader: "",
        paragraphs: {},
      };

      const pageHeader = $(`p:contains("${link.title}")`).text();
      parsedData.pageHeader = pageHeader;

      parsedData.paragraphs = {};
      const container = $("div.mw-parser-output").contents();
      const paragraphs = $("div.mw-parser-output > h2");

      paragraphs.each((i, ele) => {
        const paragraphTitle = $(ele.firstChild)
          .text()
          .replace("/[^a-zA-Z]/g", "");

        if (
          ["Przypisy", "Bibliografia", "Linki zewnętrzne", ""].includes(
            paragraphTitle
          )
        )
          return;

        parsedData.paragraphs[paragraphTitle] = {};
        parsedData = getParagraphDataRecursive(
          $,
          ele,
          parsedData,
          paragraphTitle,
          container
        );
      });

      saveParsedDataToJSON(parsedData);
    }
  }

  logger.log(logger.progress.bar);
})();

const getParagraphDataRecursive = ($, ele, parsedData, title, container) => {
  const e = $(ele).next();
  const text = e.text();
  const eleName = e["0"].name;

  if (eleName == "h2" || eleName == "undefined") return parsedData;

  parsedData.paragraphs[title][eleName] = {
    text: text,
  };

  return getParagraphDataRecursive($, e, parsedData, title, container);
};

const saveParsedDataToJSON = (data) => {
  const stringifiedData = JSON.stringify(data);
  const jsonFileName = data.title.toLowerCase().replace(/[ ]/, "_") + ".json";
  const dir = path.join(process.cwd(), DATA_DIR);
  const file = path.join(dir, jsonFileName);

  if (fs.e)
    fs.mkdir(dir, { recursive: false }, (err) => {
      if (err.code != "EEXIST") {
        console.log(err);
      }
    });

  fs.writeFile(file, stringifiedData, { flag: "w" }, (err) => {
    console.log(err);
  });
};
