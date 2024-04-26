// https://crawlee.dev/docs/examples/crawl-relative-links
// const crawlUrl = "https://tatsucreate.com/";
const crawlUrl = "https://www.marsflag.com/ja/";
import {
  PlaywrightCrawler,
  EnqueueStrategy,
  Dataset,
  KeyValueStore,
  LogLevel,
  OpenGraphProperty,
  constructRegExpObjectsFromPseudoUrls,
} from "crawlee";

/********************
 * crawler settings
 ********************/
const urls: string[] = [];

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

    const newUrl = page.url();
    urls.push(newUrl);

    // Save the page data to the dataset
    const title = await page.title();
    await pushData({
      title,
      url: request.url,
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
  }>();

  // calling reduce function and using memo to calculate number of headers
  const dataSetObjArr = await dataset.map((value) => {
    return {
      url: value.url,
      title: value.title,
    };
  });

  let pathParts: string[][] = [];

  urls.forEach((url) => {
    pathParts.push(new URL(url).pathname.split("/").filter(Boolean));
  });

  const result = {};

  // TODO: x, y, level
  let counter = 0;
  pathParts.reduce((memo, parts, index, arr) => {
    let obj: { [key: string]: any } = memo;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!obj[part]) {
        obj[part] = {
          url: dataSetObjArr[counter].url,
          title: dataSetObjArr[counter].title,
          level: parts.length,
          x: counter * 200,
          y: parts.length * 200 + 200,
        };
      }

      if (parts.length !== arr[index - 1]?.length) {
        counter = 0;
      }

      obj = obj[part];
    }
    counter++;
    console.log("counter", counter);
    return memo;
  }, result);

  // saving result of map to default Key-value store
  await KeyValueStore.setValue("page_data", dataSetObjArr);
  await KeyValueStore.setValue("site_tree", result);
};

/**************************************
 * Run the crawler and process the data
 **************************************/
await crawler.run([crawlUrl]);
migration();
