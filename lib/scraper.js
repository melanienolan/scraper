const puppeteer = require("puppeteer");
const fs = require("fs");

const url =
  "https://www.amazon.co.uk/Best-Sellers-Kindle-Store-eBooks/zgbs/digital-text/341689031/ref=zg_bs";

module.exports = async function scrape() {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36"
    );
    await page.goto(url);
    await page.waitForSelector(".zg-item-immersion");
    const items = await page.$$(".zg-item-immersion");

    const fullItems = await Promise.all(
      items.map(async (item) => ({
        title: await item.$eval(
          ".zg-text-center-align img",
          (node) => node.alt
        ),
        image: await item.$eval(
          ".zg-text-center-align img",
          (node) => node.src
        ),
        author: await item.$eval(
          ".aok-inline-block.zg-item > .a-row.a-size-small",
          (node) => node.innerText
        ),
        price: await item.$eval(".p13n-sc-price", (node) => node.innerText),
        rating: await item.$eval(
          ".a-icon-row .a-link-normal",
          (node) => node.title
        ),
      }))
    );

    fs.writeFile("data.json", JSON.stringify(fullItems, null, 2), (err) => {
      if (err) throw err;
      console.log("Data written to data.json");
    });

    await browser.close();
  } catch (e) {
    console.log("error", e);
  }
};
