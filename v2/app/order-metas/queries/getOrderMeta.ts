import { NotFoundError, resolver } from "blitz"
import db from "db"
import { z } from "zod"

const GetOrderMeta = z.object({
  orderIndex: z.string().optional(),
})

export default resolver.pipe(resolver.zod(GetOrderMeta), async ({ orderIndex }) => {
  if (!orderIndex) {
    throw NotFoundError
  }

  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const orderMeta = await db.orderMeta.findFirst({
    where: { OR: [{ orderIndex }] },
    include: {
      materials: true,
    },
  })

  if (!orderMeta)
    return db.orderMeta.create({
      data: {
        orderIndex,
        materialIds: [],
        ingredients: [],
      },
      include: {
        materials: true,
      },
    })

  return orderMeta
})
