/* eslint-disable no-undef */
import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowRightIcon,
} from "@heroicons/react/20/solid"
import getOrders from "app/orders/queries/getOrders"
import { useMutation, useQuery } from "blitz"
import cn from "clsx"
import { addDays, endOfDay, format, startOfDay } from "date-fns"
import { MandarinTraditional } from "flatpickr/dist/l10n/zh-tw"
import "flatpickr/dist/themes/airbnb.css"
import { useCallback, useEffect, useMemo, useState } from "react"
import Flatpickr from "react-flatpickr"
import useDebouncedValue from "../../hooks/useDebouncedValue"
// import Button from "../../primitives/Button"
import Loader from "../../primitives/Loader"
import supabaseClient from "../../services/supabase"
import { downloadURI } from "../../util/dom"
import downloadOrders from "../mutations/downloadOrders"
import OrderCard from "./OrderCard"
import OrderStats from "./OrderStats"

const FilteredOrdersGrid = () => {
  const [dateRange, setDateRange] = useState<[Date, Date]>([new Date(), new Date()])
  const [keyword, setKeyword] = useState("")
  const debouncedKeyword = useDebouncedValue(keyword, 500)

  const where = useMemo(
    () =>
      ({
        deliveryDate: {
          gte: startOfDay(dateRange[0] || dateRange[1]),
          lt: endOfDay(dateRange[1] || dateRange[0]),
        },
        OR: [
          { customerPhone: { contains: debouncedKeyword, mode: "insensitive" } },
          { customerName: { contains: debouncedKeyword, mode: "insensitive" } },
          { customerSocialName: { contains: debouncedKeyword, mode: "insensitive" } },
        ],
      } as any),
    [debouncedKeyword, dateRange]
  )

  const [orders, { refetch, isFetching }] = useQuery(
    getOrders,
    { where },
    {
      suspense: false,
    }
  )
  const [orderAssets, setOrderAssets] = useState<string[]>([])
  const refreshOrderAssets = useCallback(() => {
    return supabaseClient.storage
      .from("order-assets")
      .list(undefined, {
        limit: 200,
        offset: 0,
        sortBy: { column: "updated_at", order: "desc" },
      })
      .then(({ data }) => data && setOrderAssets(data.map((i) => i.name)))
  }, [])
  useEffect(() => {
    const refreshAssets = async () => {
      await refreshOrderAssets()
    }
    refreshAssets()
  }, [refreshOrderAssets])

  const [loadingDownloadOrdersOfDay, setLoadingDownloadOrdersOfDay] = useState(false)
  const [downloadOrdersMutation] = useMutation(downloadOrders)

  const downloadOrdersOfDay = useCallback(
    async (event) => {
      event?.preventDefault()

      setLoadingDownloadOrdersOfDay(true)
      try {
        const linkToOrdersOfDay = await downloadOrdersMutation({ date: dateRange[0] })
        downloadURI(linkToOrdersOfDay, `Orders of ${format(dateRange[0], "M_d")}.pdf`)
      } catch {}
      setLoadingDownloadOrdersOfDay(false)
    },
    [dateRange, downloadOrdersMutation]
  )

  return (
    <div className="m-3">
      <input
        className="mb-3 w-full rounded-lg border-none p-2 shadow-sm dark:bg-slate-800 dark:text-white"
        type="text"
        placeholder="搜尋電話"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
      />
      <div className="flex gap-2">
        <div className="mb-3 flex min-w-0 flex-1 items-center gap-2">
          <ArrowLeftIcon
            className="h-5 w-5 cursor-pointer"
            onClick={() => setDateRange([addDays(dateRange[0], -1), addDays(dateRange[0], -1)])}
          />
          <Flatpickr
            options={{
              // @ts-expect-error
              position: "auto center",
              mode: "range",
              locale: MandarinTraditional,
            }}
            className="min-w-0 flex-1 cursor-pointer border-none bg-transparent text-center font-bold leading-5"
            value={dateRange}
            onChange={(dateRange) => {
              if (!dateRange[0]) {
                return
              }
              setDateRange(dateRange as any)
            }}
          />
          <ArrowRightIcon
            className="h-5 w-5 cursor-pointer"
            onClick={() => setDateRange([addDays(dateRange[0], 1), addDays(dateRange[0], 1)])}
          />
          <button onClick={downloadOrdersOfDay} disabled={loadingDownloadOrdersOfDay}>
            {loadingDownloadOrdersOfDay ? (
              <Loader className="h-5 w-5 bg-black" />
            ) : (
              <ArrowDownTrayIcon className="h-5 w-5 cursor-pointer" />
            )}
          </button>
          <ArrowPathIcon
            className={cn("h-5 w-5 cursor-pointer", isFetching && "animate-reverse-spin")}
            onClick={() => refetch()}
          />
        </div>
      </div>
      <div className="my-2 flex flex-col gap-2">
        {/* <OrderAssetsSlide /> */}
        <OrderStats dateRange={dateRange} />
        {/* <OrderCakes className="sm:hidden" dateRange={dateRange} /> */}
      </div>
      <div className="flex gap-2 pb-3">
        {/* <OrderCakes className="max-sm:hidden" dateRange={dateRange} /> */}
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {orders?.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              orderAssets={orderAssets.filter(
                (asset) =>
                  order.receivedAt?.toISOString() &&
                  (asset === order.receivedAt?.toISOString() ||
                    asset.startsWith(`${order.receivedAt?.toISOString()}-`))
              )}
              onUpdate={refreshOrderAssets}
            />
          ))}
        </div>
      </div>
      {/* {hasNextPage && (
        <div className="py-2 w-full text-center">
          <Button
            className="mx-auto"
            variant="secondary"
            disabled={isFetching}
            onClick={() => fetchNextPage()}
          >
            {!isFetching ? "Load More" : "Loading..."}
          </Button>
        </div>
      )} */}
    </div>
  )
}

export default FilteredOrdersGrid
