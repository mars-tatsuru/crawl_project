// https://crawlee.dev/docs/examples/crawl-relative-links
const crawlUrl = "https://tatsucreate.com/";
import {
  PlaywrightCrawler,
  EnqueueStrategy,
  Dataset,
  KeyValueStore,
} from "crawlee";

/********************
 * crawler settings
 ********************/
const crawler = new PlaywrightCrawler({
  // Limitation for only 10 requests (do not use if you want to crawl all links)
  maxRequestsPerCrawl: 10,
  // proxyConfiguration,

  async requestHandler({ request, page, enqueueLinks, log, pushData }) {
    // Log the URL of the page being crawled
    log.info(`crawling ${request.url}...`);

    // https://crawlee.dev/api/core/function/enqueueLinks
    await enqueueLinks({
      strategy: EnqueueStrategy.All,
    });

    // Save the page data to the dataset
    const title = await page.title();
    await pushData({ title, url: request.url });
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
  const dataSetObj = await dataset.map((value) => {
    return {
      url: value.url,
      title: value.title,
    };
  });

  // console.log("pagesHeadingCount", pagesHeadingCount);

  // saving result of map to default Key-value store
  await KeyValueStore.setValue("page_data", dataSetObj);
};

/**************************************
 * Run the crawler and process the data
 **************************************/
await crawler.run([crawlUrl]);
migration();
