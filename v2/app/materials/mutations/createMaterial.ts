import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

export const CreateMaterial = z.object({
  name: z.string(),
})

export default resolver.pipe(resolver.zod(CreateMaterial), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const material = await db.material.create({ data: input })

  return material
})
