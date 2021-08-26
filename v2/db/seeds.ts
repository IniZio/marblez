import db from "./index"

/*
 * This seed function is executed when you run `blitz db seed`.
 *
 * Probably you want to use a library like https://chancejs.com
 * or https://github.com/Marak/Faker.js to easily generate
 * realistic data.
 */
const seed = async () => {
  const material = await db.material.create({
    data: {
      name: "Candle",
    },
  })

  const order = await db.order.findFirst()

  if (order) {
    await db.orderMeta.create({
      data: {
        orderIndex: order.index,
        materialIds: [material.id],
        ingredients: [
          {
            materialId: material.id,
            amount: 3,
          },
        ],
      },
    })
  }
}

export default seed
