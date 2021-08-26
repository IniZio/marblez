import { CollectionIcon } from "@heroicons/react/outline"
import { Order } from "@prisma/client"
import { format } from "date-fns"
import { Suspense, useMemo, useState } from "react"
import OrderMetaList from "../../order-metas/components/OrderMetaList"
import Dialog from "../../primitives/Dialog"

export interface OrderProps {
  order: Order
  onUpdate?: () => any
}

function get(obj: any, path: string, defValue: any = undefined) {
  // If path is not defined or it has false value
  if (!path) return undefined
  // Check if path is string or array. Regex : ensure that we do not have '.' and brackets.
  // Regex explained: https://regexr.com/58j0k
  const pathArray = Array.isArray(path) ? path : (path as unknown as string).match(/([^[.\]])+/g)
  // Find value if exist return otherwise return undefined value;
  return (
    pathArray?.reduce((prevObj: any, key: string) => prevObj && prevObj[key], obj as any) ||
    defValue
  )
}

function lineIf(o: any, fields: any, opt: any = {}) {
  if (!o || !fields) {
    return null
  }

  const lineArr = fields
    .map(function (f, i) {
      if (!f) {
        return null
      }

      const value = get(o, f)

      if (!value) {
        return null
      }

      if (opt && opt.overrides && opt.overrides[i]) {
        return opt.overrides[i](get(o, f))
      }
      if (f === "deliveryDate" && o[f]) {
        if (o[f]) {
          return format(o[f], "MM/dd")
        }
        return ""
      }

      if (
        [
          "otherAttributes.cake",
          "otherAttributes.shape",
          "otherAttributes.color",
          "otherAttributes.taste",
          "otherAttributes.letter",
        ].includes(f)
      ) {
        return <b>{get(o, f)?.replace(/\([^())]*\)/g, "")}</b>
      }

      return get(o, f)
    })
    .filter(Boolean)
    .map((line) => <>{line} </>)

  return lineArr.length > 0 ? (
    <div>
      {(opt && opt.prefix) || ""} {lineArr}
    </div>
  ) : (
    ""
  )
}

export const order2Lines = (order: any) =>
  [
    lineIf(order, ["customerName", "customerPhone"], { prefix: "👨 " }),
    lineIf(order, ["deliveryDate", "deliveryTime"], { prefix: "🕐 " }),
    lineIf(order, ["otherAttributes.cake", "otherAttributes.size"], { prefix: "🎂 " }),
    lineIf(order, ["otherAttributes.decorations", "otherAttributes.toppings"], { prefix: "📿 " }),
    lineIf(order, ["otherAttributes.shape", "otherAttributes.color"], { prefix: "‎‎‎⠀⠀ " }),
    lineIf(order, ["otherAttributes.taste", "otherAttributes.letter"], { prefix: "‎‎⠀⠀ " }),
    lineIf(order, ["otherAttributes.innerTaste", "otherAttributes.bottomTaste"], {
      prefix: "‎‎⠀⠀ ",
    }),
    lineIf(order, ["otherAttributes.sentence"], { prefix: "✍️️ " }),
    lineIf(order, ["otherAttributes.paidSentence"], { prefix: "🍫️ " }),
    lineIf(order, ["customerSocialChannel", "customerSocialName"], { prefix: "📲 " }),
    lineIf(order, ["deliveryMethod", "deliveryAddress"], { prefix: "🚚 " }),
    lineIf(order, ["remarks"]),
  ].filter(Boolean)

function OrderCard({ order }: OrderProps) {
  const lines = useMemo(() => order2Lines(order), [order])
  const [orderMetasIsOpen, setOrderMetasIsOpen] = useState(false)

  return (
    <>
      <div className="overflow-hidden relative p-3 pb-8 w-full text-sm leading-6 rounded border">
        <p className="whitespace-pre-wrap">{lines}</p>
        <div className="absolute right-3 bottom-3">
          <CollectionIcon
            className="w-5 h-5 cursor-pointer"
            onClick={() => setOrderMetasIsOpen(true)}
          />
        </div>
      </div>
      <Dialog open={orderMetasIsOpen} onClose={() => setOrderMetasIsOpen(false)}>
        <Suspense fallback="Loading...">
          <OrderMetaList orderIndex={order?.id} />
        </Suspense>
      </Dialog>
    </>
  )
}

export default OrderCard
