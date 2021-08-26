import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const UpdateOrderMeta = z.object({
  id: z.string(),
  name: z.string().optional(),
  materialIds: z.array(z.string()).optional(),
  ingredients: z.array(z.any()).optional(),
})

export default resolver.pipe(
  resolver.zod(UpdateOrderMeta),
  // resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const orderMeta = await db.orderMeta.update({ where: { id }, data })

    return orderMeta
  }
)
