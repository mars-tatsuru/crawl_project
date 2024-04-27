// https://crawlee.dev/docs/examples/crawl-relative-links
// const crawlUrl = "https://tatsucreate.com/";
const crawlUrl = "https://www.marsflag.com/ja/";
import {
  PlaywrightCrawler,
  EnqueueStrategy,
  Dataset,
  KeyValueStore,
} from "crawlee";

/********************
 * crawler settings
 ********************/
const urls: string[] = [];
import path from "path";

const crawler = new PlaywrightCrawler({
  // Limitation for only 10 requests (do not use if you want to crawl all links)
  maxRequestsPerCrawl: 20,

  async requestHandler({ request, page, enqueueLinks, log, pushData }) {
    // Log the URL of the page being crawled
    log.info(`crawling ${request.url}...`);

    // https://crawlee.dev/api/core/function/enqueueLinks
    await enqueueLinks({
      // strategy: EnqueueStrategy.SameDomain,
      // strategy: EnqueueStrategy.All,
      strategy: EnqueueStrategy.SameOrigin,
    });

    // Save the page data to the dataset
    const title = await page.title();
    const url = page.url();

    // Capture the screenshot of the page
    const thumbnailFolder = path.join("..", "..", "public", "screenshots");
    const thumbnailName = `${url
      .replace("https://www.marsflag.com/", "")
      .replace(/\//g, "-")}.png`;

    const thumbnailPath = path.join(thumbnailFolder, thumbnailName);

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

  // for object array sorting
  const sortDataSetObjArr = dataSetObjArr.sort(
    (a, b) => a.url.split("/").length - b.url.split("/").length
  );

  // ex) https://www.marsflag.com/ja/ => [ 'ja' ]
  let pathParts: string[][] = [];
  dataSetObjArr.forEach((item) => {
    pathParts.push(
      item.url
        .replace("https://www.marsflag.com/", "")
        .split("/")
        .filter((part) => part !== "")
    );
  });

  // return the result of the map to the default Key-value store
  const result = {};

  // TODO: x, y, level
  // create site tree data
  let positionXCounter = 0;
  pathParts
    .sort((a, b) => a.length - b.length)
    .map((parts, index) => {
      let obj: { [key: string]: any } = result;

      parts.map((part) => {
        if (!obj[part]) {
          obj[part] = {
            url: sortDataSetObjArr[index].url,
            title: sortDataSetObjArr[index].title,
            thumbnailPath: sortDataSetObjArr[index].thumbnailPath,
            level: parts.length,
            x: positionXCounter * 200,
            y: parts.length * 200 + 200,
          };
        }

        if (parts.length !== pathParts[index - 1]?.length) {
          positionXCounter = 0;
        }

        obj = obj[part];
      });

      positionXCounter++;
    });

  // saving result of map to default Key-value store
  await KeyValueStore.setValue("page_data", dataSetObjArr);
  await KeyValueStore.setValue("site_tree", result);
};

/**************************************
 * Run the crawler and process the data
 **************************************/
await crawler.run([crawlUrl]);
migration();
