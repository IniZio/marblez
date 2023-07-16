import {
  ArrowUpTrayIcon,
  DocumentIcon,
  EyeIcon,
  PencilIcon,
  ShareIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import { Order } from "@prisma/client"
import Loader from "app/primitives/Loader"
import { format } from "date-fns"
import isImage from "is-image"
import { useCallback, useMemo, useRef, useState } from "react"
import supabaseClient from "../../services/supabase"
import { isMobile } from "../../util/device"

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
  const [isUploading, setIsUploading] = useState(false)
  const handleUploadFile = useCallback(
    async (event) => {
      const uploadedfile: File = event.target.files[0]
      if (!order.receivedAt?.toISOString()) {
        return Promise.resolve()
      }

      // resize
      const resizedFile = isImage(uploadedfile.name)
        ? await new Promise<File>((resolve) => {
            const img = new Image()
            const MAX_DIMENSION = 600
            img.src = URL.createObjectURL(uploadedfile)
            img.onload = () => {
              const elem = document.createElement("canvas")
              const scaleFactor = Math.min(MAX_DIMENSION / img.width, MAX_DIMENSION / img.height)
              if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
                elem.width = img.width * scaleFactor
                elem.height = img.height * scaleFactor
              } else {
                elem.width = img.width
                elem.height = img.height
              }
              const ctx = elem.getContext("2d")
              ctx?.drawImage(img, 0, 0, elem.width, elem.height)
              ctx?.canvas.toBlob(
                (blob) => {
                  const file = new File([blob as Blob], uploadedfile.name, {
                    type: "image/jpeg",
                    lastModified: Date.now(),
                  })
                  resolve(file)
                },
                "image/jpeg",
                1
              )
            }
          })
        : uploadedfile

      setIsUploading(true)
      return supabaseClient.storage
        .from("order-assets")
        .upload(
          `${order.receivedAt?.toISOString()}-${new Date().toISOString()}.${uploadedfile.name
            .split(".")
            .pop()}`,
          resizedFile,
          {
            cacheControl: "3600",
            upsert: true,
          }
        )
        .then(onUpdate)
        .finally(() => setIsUploading(false))
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
      <div className="relative w-full overflow-hidden rounded-lg bg-white p-3 pb-8 text-sm font-medium leading-6 shadow-md dark:bg-slate-800">
        <p className={"whitespace-pre-wrap" + (orderAssets.length ? " mr-12" : "")}>
          {lines.map((line, index) => (
            <div key={index} className="my-0.5">
              {line}
            </div>
          ))}
        </p>
        <div className="absolute top-5 right-5 flex flex-col gap-2">
          {orderAssets.map((assetName) => (
            <div key={assetName} className="relative">
              <a
                href={`${process.env.ORDER_ASSETS_CDN_URL}/order-assets/${assetName}`}
                target="_blank"
                rel="noreferrer"
                className="relative flex h-[40px] items-center justify-center overflow-hidden"
              >
                {isImage(assetName) || !assetName.includes(".") ? (
                  <img
                    src={`${process.env.ORDER_ASSETS_CDN_URL}/order-assets/${assetName}`}
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
                ) : (
                  <DocumentIcon width={25} height={25} />
                )}
              </a>
              {editMode && (
                <XMarkIcon
                  className="absolute -top-2.5 -right-2.5 h-5 w-5 cursor-pointer rounded-full bg-white p-0.5 text-red-500 shadow-inner"
                  onClick={makeHandleDeleteFile(assetName)}
                />
              )}
            </div>
          ))}
          {editMode &&
            (isUploading ? (
              <Loader className="m-auto h-5 w-5" />
            ) : (
              <div className="cursor-pointer" onClick={() => fileUploadRef.current?.click()}>
                <ArrowUpTrayIcon className="mx-auto h-5 w-5 cursor-pointer" />
                <input
                  className="hidden"
                  ref={fileUploadRef}
                  type="file"
                  onChange={handleUploadFile}
                />
              </div>
            ))}
        </div>
        <div className="absolute right-3 bottom-3 flex gap-2">
          <div className="flex gap-4">
            <ShareIcon className="h-5 w-5 cursor-pointer" onClick={handleShareOrder} />
            {editMode ? (
              <EyeIcon className="h-5 w-5 cursor-pointer" onClick={toggleEditMode} />
            ) : (
              <PencilIcon className="h-5 w-5 cursor-pointer" onClick={toggleEditMode} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default OrderCard
