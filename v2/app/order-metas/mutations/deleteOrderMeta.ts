import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const DeleteOrderMeta = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteOrderMeta),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const orderMeta = await db.orderMeta.deleteMany({ where: { id } })

    return orderMeta
  }
)
