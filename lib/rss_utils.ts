import Parser from 'rss-parser';

const parser = new Parser();

export interface NewsItem {
  title: string;
  link: string;
  pubDate?: string;
  description?: string;
  source: string;
}

// Define a list of RSS feeds to fetch news from
const RSS_FEEDS = [
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
  },
  {
    name: "The Decision Lab",
    url: "https://www.thedecisionlab.com/feed/",
  },
  {
    name: "Hacker News",
    url: "https://hnrss.org/frontpage",
  },
  {
    name: "The Verge",
    url: "https://www.theverge.com/rss/full.xml",
  },
  {
    name: "OpenAI Blog",
    url: "https://openai.com/blog/rss/",
  },
  {
    name: "DeepMind",
    url: "https://deepmind.com/blog/feed/basic/",
  },
  {
    name: "Stripe Blog",
    url: "https://stripe.com/blog/feed.rss",
  },
  {
    name: "First Round Review",
    url: "https://firstround.com/review/feed.xml",
  },
  {
    name: "The Pragmatic Engineer",
    url: "https://blog.pragmaticengineer.com/rss/",
  },
  {
    name: "MIT News - AI",
    url: "https://news.mit.edu/rss/topic/artificial-intelligence2",
  },
];

/**
 * Fetch and parse a single RSS feed, returning an array of news items
 */
async function fetchRSSFeed(feedUrl: string, sourceName: string): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(feedUrl);
    const items: NewsItem[] = (feed.items || []).slice(0, 5).map((item) => ({
      title: item.title || '',
      link: item.link || '',
      pubDate: item.pubDate || undefined,
      description: item.contentSnippet || item.content || '',
      source: sourceName,
    }));
    return items;
  } catch (error) {
    console.error(`Error fetching RSS feed from ${sourceName}:`, error);
    return [];
  }
}

/**
 * Fetch news from all defined RSS feeds and return a combined, sorted list of news items
 */
export async function fetchAllNews(): Promise<NewsItem[]> {
  const allNewsPromises = RSS_FEEDS.map((feed) =>
    fetchRSSFeed(feed.url, feed.name)
  );
  
  const allNewsArrays = await Promise.all(allNewsPromises);
  const allNews = allNewsArrays.flat();
  
  // newest news first
  return allNews.sort((a, b) => {
    if (!a.pubDate || !b.pubDate) return 0;
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
  });
}

/**
 * format news items into a structured summary, both in plain text and HTML format
 */
export function formatNewsSummary(newsItems: NewsItem[]): {
  summary: string;
  html: string;
} {
  // top 15 news items
  const topNews = newsItems.slice(0, 15);
  
  // categorize news by source
  const newsBySource = topNews.reduce((acc, item) => {
    if (!acc[item.source]) {
      acc[item.source] = [];
    }
    acc[item.source].push(item);
    return acc;
  }, {} as Record<string, NewsItem[]>);

  // Text format summary
  let summaryText = '📰 Daily News Summary\n\n';
  Object.entries(newsBySource).forEach(([source, items]) => {
    summaryText += `\n【${source}】\n`;
    items.forEach((item, index) => {
      summaryText += `${index + 1}. ${item.title}\n`;
      if (item.description) {
        const shortDesc = item.description.substring(0, 100);
        summaryText += `   ${shortDesc}${item.description.length > 100 ? '...' : ''}\n`;
      }
      summaryText += `   Link: ${item.link}\n\n`;
    });
  });

  // HTML format summary
  let htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px;">
        📰 Daily News Summary
      </h1>
      <p style="color: #666; font-size: 14px;">
        ${new Date().toLocaleDateString('en-CA', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          weekday: 'long'
        })}
      </p>
  `;

  Object.entries(newsBySource).forEach(([source, items]) => {
    htmlContent += `
      <div style="margin: 30px 0;">
        <h2 style="color: #007bff; border-left: 4px solid #007bff; padding-left: 10px;">
          ${source}
        </h2>
    `;

    items.forEach((item) => {
      htmlContent += `
        <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
          <h3 style="margin: 0 0 10px 0; color: #333;">
            <a href="${item.link}" style="color: #007bff; text-decoration: none;">
              ${item.title}
            </a>
          </h3>
          ${item.description ? `
            <p style="color: #666; line-height: 1.6; margin: 10px 0;">
              ${item.description.substring(0, 200)}${item.description.length > 200 ? '...' : ''}
            </p>
          ` : ''}
          ${item.pubDate ? `
            <p style="color: #999; font-size: 12px; margin: 5px 0;">
              📅 ${new Date(item.pubDate).toLocaleString('zh-CN')}
            </p>
          ` : ''}
          <a href="${item.link}" style="color: #007bff; text-decoration: none; font-size: 14px;">
            Read More →
          </a>
        </div>
      `;
    });

    htmlContent += `</div>`;
  });

  htmlContent += `
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 12px;">
        <p>Thank you for subscribing to the daily news summary!</p>
        <p>This summary is automatically generated from multiple news sources.</p>
      </div>
    </div>
  `;

  return {
    summary: summaryText,
    html: htmlContent,
  };
}
