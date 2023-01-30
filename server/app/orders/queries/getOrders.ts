import { resolver } from "blitz"
import db, { Prisma } from "db"

export interface GetOrdersInput extends Pick<Prisma.OrderFindManyArgs, "where" | "orderBy"> {}

export default resolver.pipe(async ({ where }: GetOrdersInput) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  if (!where) {
    where = {}
  }

  where.paid = { equals: true }

  return db.order.findMany({
    where,
    orderBy: [
      {
        deliveryDate: "asc",
      },
      {
        deliveryTime: "asc",
      },
    ],
  })
})
