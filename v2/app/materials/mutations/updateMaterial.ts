import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const UpdateMaterial = z.object({
  id: z.number(),
  name: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdateMaterial),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const material = await db.material.update({ where: { id }, data })

    return material
  }
)
