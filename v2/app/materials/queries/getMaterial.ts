import { resolver, NotFoundError } from "blitz"
import db from "db"
import { z } from "zod"

const GetMaterial = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.string().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(resolver.zod(GetMaterial), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const material = await db.material.findFirst({ where: { id } })

  if (!material) throw new NotFoundError()

  return material
})