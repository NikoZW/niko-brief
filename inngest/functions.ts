import { fetchAllNews, formatNewsSummary } from "@/lib/rss_utils";
import { inngest } from "./client";
import { Resend } from "resend";
import { send } from "process";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);

export const sendDailyNews= inngest.createFunction(
  { id: "send-daily-news" },
  // { event: "test/send.daily.news" },
 { cron: "TZ=America/Vancouver 0 14 * * *" },// every day at 9am
  async ({ event, step }) => {
    // 1. fetch news from RSS feeds
    const newsItems = await step.run("fetch-news", async () => {
      console.log("Fetching news from RSS feeds...");
      const news = await fetchAllNews();
      console.log("News fetched:", news.length, "items");
      return news;
    });
    // 2. generate summary
    const newsSummary = await step.run("format-summary", async () => {
      console.log("Formatting news summary...");
      const summary = formatNewsSummary(newsItems);
      console.log("News summary formatted",summary);
      return summary;
    });
    // 3. generate email content to user
    const resend = new Resend(process.env.RESEND_API_KEY);
    const {data,error} =await step.run("create-email", async () => {
      console.log("Creating email...");
      const result = await resend.broadcasts.create({
        from: "Niko Brief <nikoBrief@contact.nikow.work>",
        segmentId: "f80a9b33-78a7-4b42-91cf-849d3fb90f47", // replace with your actual segment ID
        subject: "Your Daily News Summary from Niko Brief" + new Date().toLocaleDateString('en-CA',{year:'numeric',month:'long',day:'numeric'}),
        html: newsSummary.html,
      });
      return result;
    });
    // 4. send email to user
    const {error: sendError} = await step.run("send-email", async () => {
      console.log("Sending Email...");
      const result = await resend.broadcasts.send(data?.id!);
      return result;
    });
    if (sendError) {
      console.error("Error sending email:", sendError);
      return {message: sendError.message};
    }
    return { message: "Daily news summary sent successfully!" };
  },
);