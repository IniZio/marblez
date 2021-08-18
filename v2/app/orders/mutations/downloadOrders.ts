import { resolver, NotFoundError } from "blitz";
import db from "db";
import { z } from "zod";
import agent from 'superagent';

const DownloadOrders = z.object({
  date: z.date(),
});

export default resolver.pipe(
  resolver.zod(DownloadOrders),
  async ({ date }) => {
    const res = await agent.get(`${process.env.GOOGLE_SHEET_SCRIPT_URL}?date=${date.toISOString()}&num_of_column=2`);
    return JSON.parse(res.text)?.url;
  }
);
