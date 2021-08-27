import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const DeleteMaterial = z.object({
  id: z.string(),
})

export default resolver.pipe(resolver.zod(DeleteMaterial), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const material = await db.material.deleteMany({ where: { id } })

  return material
})
