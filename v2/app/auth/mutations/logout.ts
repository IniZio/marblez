import { Ctx } from "blitz"

export default async function logout(_: any, ctx: Ctx) {
  return ctx.session.$revoke()
}
