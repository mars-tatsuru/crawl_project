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
} from "crawlee";

/********************
 * crawler settings
 ********************/
const crawler = new PlaywrightCrawler({
  // Limitation for only 10 requests (do not use if you want to crawl all links)
  maxRequestsPerCrawl: 20,

  async requestHandler({ request, page, enqueueLinks, log, pushData }) {
    log.info(`crawler: ${page.route}...`);
    // Log the URL of the page being crawled
    log.info(`crawling ${request.url}...`);

    // https://crawlee.dev/api/core/function/enqueueLinks
    await enqueueLinks({
      // strategy: EnqueueStrategy.SameDomain,
      // strategy: EnqueueStrategy.All,

      strategy: EnqueueStrategy.SameOrigin,
    });

    //TODO: fix magic string
    const newUrl = page.url().replace("https://www.marsflag.com/", "");
    log.info(`newUrl: ${newUrl}`);

    // count "/" in newUrl
    const level = (newUrl.match(/\//g) || []).length;
    log.info(`level: ${level}`);

    // Save the page data to the dataset
    const title = await page.title();
    await pushData({
      title,
      url: request.url,
      level,
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
    level: number;
  }>();

  // calling reduce function and using memo to calculate number of headers
  const dataSetObj = await dataset.map((value) => {
    return {
      url: value.url,
      title: value.title,
      level: value.level,
    };
  });

  // saving result of map to default Key-value store
  await KeyValueStore.setValue("page_data", dataSetObj);
};

/**************************************
 * Run the crawler and process the data
 **************************************/
await crawler.run([crawlUrl]);
migration();
