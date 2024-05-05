// https://crawlee.dev/docs/examples/crawl-relative-links
// const crawlUrl = "https://tatsucreate.com/";
// const crawlUrl = "https://www.marsflag.com/";
// const crawlUrl = "https://ja.vuejs.org/";
// const crawlUrl = "https://www.endo-bag.co.jp/";
// const crawlUrl = "https://vuild.co.jp/";
// const crawlUrl = "https://illupinojapan.jp/";
// const crawlUrl = "https://roseaupensant.jp/";
// const crawlUrl = "https://chot-inc.com/";
const crawlUrl = "https://www.marsflag.com/";
// const crawlUrl = "https://www.wismettac.com/ja/group/group/wfoods.html";
import {
  PlaywrightCrawler,
  EnqueueStrategy,
  Dataset,
  KeyValueStore,
} from "crawlee";
import { url } from "inspector";

/********************
 * crawler settings
 ********************/
// TODO: except pdf and zip files
const urls: string[] = [];
import path from "path";

const crawler = new PlaywrightCrawler({
  // Limitation for only 10 requests (do not use if you want to crawl all links)
  // https://crawlee.dev/api/playwright-crawler/interface/PlaywrightCrawlerOptions#maxRequestsPerCrawl
  // NOTE: In cases of parallel crawling, the actual number of pages visited might be slightly higher than this value.
  // maxRequestsPerCrawl: 20,

  async requestHandler({ request, page, enqueueLinks, log, pushData }) {
    // Log the URL of the page being crawled
    log.info(`crawling ${request.url}...`);

    // https://crawlee.dev/api/core/function/enqueueLinks
    await enqueueLinks({
      // strategy: EnqueueStrategy.SameDomain,
      // strategy: EnqueueStrategy.All,
      strategy: EnqueueStrategy.SameOrigin,
      // globs: [`${crawlUrl}/*/*/*`],
    });

    // Save the page data to the dataset
    const title = await page.title();
    const url = page.url();

    // Capture the screenshot of the page
    const thumbnailFolder = path.join("..", "..", "public", "screenshots");
    let thumbnailName = "";

    const renameThumbnailName = () => {
      if (url.replace(`${crawlUrl}`, "") === "") {
        thumbnailName = `${url
          .replace(`${crawlUrl}`, "top")
          .replace("#", "")
          .replace(/\//g, "-")
          .replace(/-$/, "")}.png`;
      } else {
        thumbnailName = `${url
          .replace(`${crawlUrl}`, "")
          .replace("#", "")
          .replace(/\//g, "-")
          .replace(/-$/, "")}.png`;
      }
    };

    renameThumbnailName();
    const thumbnailPath = path.join(thumbnailFolder, thumbnailName);

    // Check if the file already exists
    await page.waitForLoadState("networkidle");

    // take a screenshot of the page
    await page.screenshot({ path: thumbnailPath });

    await pushData({
      title,
      url,
      thumbnailPath: `/screenshots/${thumbnailName}`,
    });
  },
});

/***************************************************************************************
 * Open the dataset and save the result of the map to the default Key-value store
 ***************************************************************************************/
const migration = async () => {
  const dataset = await Dataset.open<{
    url: string;
    title: string;
    thumbnailPath: string;
  }>();

  // calling reduce function and using memo to calculate number of headers
  const dataSetObjArr = await dataset.map((value) => {
    return {
      url: value.url,
      title: value.title,
      thumbnailPath: value.thumbnailPath,
    };
  });

  // for object array sorting and
  //ja , ja/about , en , en/about
  const sortDataSetObjArr = dataSetObjArr
    .filter(
      (value, index, self) =>
        self.findIndex((v) => v.url === value.url) === index
    )
    .sort((a, b) => {
      return a.url.length - b.url.length;
    })
    .sort((a, b) => a.url.split("/").length - b.url.split("/").length);

  // ex) https://www.marsflag.com/ja/ => [ 'ja' ]
  // sort the pathParts array by length and parent-child relationship
  let pathParts: string[][] = [];
  sortDataSetObjArr.map((value) => {
    const path = value.url
      .replace(crawlUrl, "")
      .split("/")
      .filter((v) => v);

    pathParts.push(path);
  });

  // return the result of the map to the default Key-value store
  const result = {};

  // create site tree data
  let positionXCounter = 0;
  pathParts
    // .sort((a, b) => a.length - b.length)
    .map((parts, index) => {
      let obj: { [key: string]: any } = result;

      // if the path is empty, add "top" to the path
      if (parts.filter((part) => part !== "top") && parts.length === 0) {
        parts.push("top");
      }

      // if the path is not starting with "top", add "top" to the path
      if (parts.length >= 1 && parts[0] !== "top") {
        parts.unshift("top");
      }

      // create site tree data
      parts.map((part, partOrder) => {
        if (!obj[part]) {
          // If partOrder is the last index of parts, add the url, title, and thumbnailPath
          if (partOrder === parts.length - 1) {
            obj[part] = {
              url: sortDataSetObjArr[index].url,
              title: sortDataSetObjArr[index].title,
              thumbnailPath: sortDataSetObjArr[index].thumbnailPath,
              level: parts.length - 1,
              // TODO: unnecessary positionXCounter and positionYCounter
              // x: positionXCounter * 200,
              // y: parts.length * 300 + 150,
            };
          } else {
            if (part === "top") {
              obj[part] = {};
            } else {
              obj[part] = {
                title: part,
                url: parts.slice(0, partOrder + 1).join("/"),
                level: parts.length - 2,
              };
            }
          }
        }

        // if (parts.length > pathParts[index - 1]?.length) {
        //   positionXCounter = 0;
        // }

        obj = obj[part];
      });

      // positionXCounter++;
    });

  // saving result of map to default Key-value store
  await KeyValueStore.setValue("page_data", dataSetObjArr);
  await KeyValueStore.setValue("page_data_sorted", sortDataSetObjArr);
  await KeyValueStore.setValue("site_tree", result);
  await KeyValueStore.setValue("site_path", pathParts);
};

/**************************************
 * Run the crawler and process the data
 **************************************/
await crawler.run([crawlUrl]);
migration();
