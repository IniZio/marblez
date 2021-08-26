import { Material } from "@prisma/client"
import { useMutation, useQuery } from "blitz"
import { debounce } from "lodash"
import { useCallback, useEffect, useMemo } from "react"
import { useImmer } from "use-immer"
import SelectMaterial from "../../materials/components/SelectMaterial"
import AmountInput from "../../primitives/AmountInput"
import updateOrderMeta from "../mutations/updateOrderMeta"
import getOrderMeta from "../queries/getOrderMeta"

export interface OrderMetaListProps {
  orderIndex: string
}

interface Ingredient {
  materialId: string
  amount: number
}

const isIngredient = (maybeIngredient: any): maybeIngredient is Ingredient => {
  return typeof maybeIngredient === "object" && maybeIngredient?.materialId
}

function OrderMetaList(props: OrderMetaListProps) {
  const [orderMeta, { refetch: refetchOrderMeta }] = useQuery(getOrderMeta, {
    orderIndex: props.orderIndex,
  })
  const [updateOrderMetaMutation] = useMutation(updateOrderMeta)

  const materialsMap = useMemo(
    () =>
      orderMeta.materials?.reduce<Record<string, Material>>(
        (map, material) => ({
          ...map,
          [material.id]: material,
        }),
        {}
      ),
    [orderMeta?.materials]
  )

  const addMaterialToOrderMeta = useCallback(
    async (materialId) => {
      await updateOrderMetaMutation({
        id: orderMeta.id,
        materialIds: [materialId, ...orderMeta.materialIds],
        ingredients: [{ materialId, amount: 0 }, ...orderMeta.ingredients],
      })
      await refetchOrderMeta()
    },
    [
      orderMeta.id,
      orderMeta.ingredients,
      orderMeta.materialIds,
      refetchOrderMeta,
      updateOrderMetaMutation,
    ]
  )

  const [ingredients, produceIngredients] = useImmer(orderMeta.ingredients)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => produceIngredients(orderMeta.ingredients), [orderMeta.ingredients])
  const handleUpdateIngredients = useMemo(
    () =>
      debounce(() => {
        if (ingredients !== orderMeta.ingredients) {
          updateOrderMetaMutation({
            id: orderMeta.id,
            ingredients: ingredients.filter((ingredient: any) => ingredient?.amount),
          })
        }
      }, 500),
    [ingredients, orderMeta.id, orderMeta.ingredients, updateOrderMetaMutation]
  )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(handleUpdateIngredients, [ingredients])

  return (
    <div>
      <SelectMaterial onChange={addMaterialToOrderMeta} />
      <ul>
        {ingredients.map(
          (ingredient, index) =>
            isIngredient(ingredient) && (
              <li key={ingredient?.materialId} className="flex items-center p-3 rounded-xl border">
                <b>{materialsMap[ingredient?.materialId]?.name}</b>
                <div className="flex-1" />
                <AmountInput
                  value={ingredient.amount}
                  onChange={(amount) => {
                    produceIngredients((ingredients: any[]) => {
                      const ingredient = ingredients[index]
                      ingredient.amount = amount
                    })
                  }}
                />
              </li>
            )
        )}
      </ul>
    </div>
  )
}

export default OrderMetaList
