import { paginate, resolver } from "blitz"
import db, { Prisma } from "db"

interface GetOrdersInput
  extends Pick<Prisma.OrderFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(async ({ where, skip = 0, take = 249 }: GetOrdersInput) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  if (!where) {
    where = {}
  }

  where.paid = { equals: true }

  const {
    items: orders,
    hasMore,
    nextPage,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.order.count({ where }),
    query: (paginateArgs) =>
      db.order.findMany({
        ...paginateArgs,
        where,
        orderBy: [
          {
            deliveryDate: "asc",
          },
          {
            deliveryTime: "asc",
          },
        ],
      }),
  })

  return {
    orders,
    nextPage,
    hasMore,
    count,
  }
})
