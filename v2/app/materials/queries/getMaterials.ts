import { paginate, resolver } from "blitz"
import db, { Prisma } from "db"

interface GetMaterialsInput
  extends Pick<Prisma.MaterialFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  async ({ where, orderBy, skip = 0, take = 100 }: GetMaterialsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: materials,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.material.count({ where }),
      query: (paginateArgs) => db.material.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      materials,
      nextPage,
      hasMore,
      count,
    }
  }
)
