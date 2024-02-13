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
  const root: Record<string, any> = {};
  let current = root;
  const Arr: any[] = [];

  urls.forEach((url) => {
    const pathParts = new URL(url).pathname.split("/").filter(Boolean);
    Arr.push(pathParts);

    pathParts.forEach((part) => {
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    });
  });

  const dataset = await Dataset.open<{
    url: string;
    title: string;
  }>();

  // calling reduce function and using memo to calculate number of headers
  const dataSetObj = await dataset.map((value) => {
    return {
      url: value.url,
      title: value.title,
    };
  });

  // saving result of map to default Key-value store
  await KeyValueStore.setValue("page_data", dataSetObj);
  await KeyValueStore.setValue("page_tree", Arr);
};

/**************************************
 * Run the crawler and process the data
 **************************************/
await crawler.run([crawlUrl]);
migration();
