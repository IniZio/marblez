import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const CreateOrderMeta = z.object({
  name: z.string(),
})

export default resolver.pipe(resolver.zod(CreateOrderMeta), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const orderMeta = await db.orderMeta.create({ data: input })

  return orderMeta
})
