import { resolver, NotFoundError } from "blitz"
import db from "db"
import { z } from "zod"

const GetOrder = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.string().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(resolver.zod(GetOrder), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const order = await db.order.findFirst({ where: { id } })

  if (!order) throw new NotFoundError()

  return order
})
