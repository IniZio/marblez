import {
  ShareIcon,
  UploadIcon,
  XIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/outline"
import { Order } from "@prisma/client"
import { format } from "date-fns"
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
// import CopyToClipboard from "react-copy-to-clipboard"
import Dialog from "../../primitives/Dialog"
import { isMobile } from "../../util/device"
import supabaseClient from "../../services/supabase"

export interface OrderProps {
  order: Order
  orderAssets: string[]
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
        return get(o, f)?.replace(/\([^())]*\)/g, "")
      }

      return get(o, f)
    })
    .filter(Boolean)

  if (!lineArr.join("")) {
    return null
  }

  return ((opt && opt.prefix) || "") + lineArr.join(" ")
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

function OrderCard({ order, orderAssets, onUpdate }: OrderProps) {
  const lines = useMemo(() => order2Lines(order), [order])
  const [editMode, setEditMode] = useState(false)
  const toggleEditMode = useCallback(() => setEditMode(!editMode), [editMode])

  const whatsappHref = useMemo(() => {
    const encodedLines = encodeURIComponent(lines.join("\n"))
    let href: string
    if (isMobile.any) {
      href = `whatsapp://send?text=${encodedLines}`
    } else {
      href = `https://web.whatsapp.com/send?text=${encodedLines}`
    }

    return href
  }, [lines])

  const handleShareOrder = useCallback(() => {
    if (navigator.share) {
      navigator
        .share({
          title: `Order for ${order.customerPhone}`,
          text: lines.join("\n"),
          url: location.href,
        })
        .then(() => console.log("Successful share"))
        .catch((error) => console.log("Error sharing", error))
    } else {
      window.open(whatsappHref, "_blank")
    }
  }, [whatsappHref, lines, order.customerPhone])

  const fileUploadRef = useRef<HTMLInputElement>(null)
  const handleUploadFile = useCallback(
    async (event) => {
      const uploadedfile = event.target.files[0]
      if (!order.receivedAt?.toISOString()) {
        return Promise.resolve()
      }

      return supabaseClient.storage
        .from("order-assets")
        .upload(`${order.receivedAt?.toISOString()}-${new Date().toISOString()}`, uploadedfile, {
          cacheControl: "3600",
          upsert: true,
        })
        .then(onUpdate)
    },
    [onUpdate, order.receivedAt]
  )
  const makeHandleDeleteFile = useCallback(
    (imageName: string) => () => {
      supabaseClient.storage.from("order-assets").remove([imageName]).then(onUpdate)
    },
    [onUpdate]
  )

  return (
    <>
      <div className="overflow-hidden relative p-3 pb-8 w-full text-sm font-medium leading-6 bg-white rounded-lg shadow-md dark:bg-slate-800">
        <p className={"whitespace-pre-wrap" + (orderAssets.length ? " mr-12" : "")}>
          {lines.map((line, index) => (
            <div key={index} className="my-0.5">
              {line}
            </div>
          ))}
        </p>
        <div className="flex absolute top-5 right-5 flex-col gap-2">
          {orderAssets.map((imageName) => (
            <div key={imageName} className="relative">
              <a
                href={`${process.env.ORDER_ASSETS_CDN_URL}/order-assets/${imageName}`}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden relative h-[40px]"
                onClick={(e) => editMode && e.preventDefault()}
              >
                <img
                  src={`${process.env.ORDER_ASSETS_CDN_URL}/order-assets/${imageName}`}
                  alt=""
                  width="40"
                  height="40"
                  onError={(e) =>
                    (e.currentTarget.src = e.currentTarget.src.replace(
                      /\?(.*)$/,
                      new Date().toISOString()
                    ))
                  }
                />
              </a>
              {editMode && (
                <XIcon
                  className="absolute -top-2.5 -right-2.5 p-0.5 w-5 h-5 text-red-500 bg-white rounded-full shadow-inner cursor-pointer"
                  onClick={makeHandleDeleteFile(imageName)}
                />
              )}
            </div>
          ))}
          {editMode && (
            <div className="cursor-pointer" onClick={() => fileUploadRef.current?.click()}>
              <UploadIcon className="mx-auto w-5 h-5 cursor-pointer" />
              <input
                className="hidden"
                ref={fileUploadRef}
                type="file"
                onChange={handleUploadFile}
              />
            </div>
          )}
        </div>
        <div className="flex absolute right-3 bottom-3 gap-2">
          <div className="flex gap-4">
            <ShareIcon className="w-5 h-5 cursor-pointer" onClick={handleShareOrder} />
            {editMode ? (
              <EyeIcon className="w-5 h-5 cursor-pointer" onClick={toggleEditMode} />
            ) : (
              <PencilIcon className="w-5 h-5 cursor-pointer" onClick={toggleEditMode} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default OrderCard
