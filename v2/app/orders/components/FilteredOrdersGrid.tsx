import { ArrowLeftIcon, ArrowRightIcon, DownloadIcon, RefreshIcon } from "@heroicons/react/solid"
import getOrders from "app/orders/queries/getOrders"
import { useMutation, useQuery } from "blitz"
import cn from "classnames"
import { addDays, endOfDay, format, startOfDay } from "date-fns"
import { MandarinTraditional } from "flatpickr/dist/l10n/zh-tw"
import "flatpickr/dist/themes/airbnb.css"
import { useCallback, useEffect, useMemo, useState } from "react"
import Flatpickr from "react-flatpickr"
import useDebouncedValue from "../../hooks/useDebouncedValue"
import supabaseClient from "../../services/supabase"
// import Button from "../../primitives/Button"
import Loader from "../../primitives/Loader"
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
    supabaseClient.storage
      .from("order-assets")
      .list(undefined, {
        limit: 200,
        offset: 0,
        sortBy: { column: "updated_at", order: "desc" },
      })
      .then(({ data }) => data && setOrderAssets(data.map((i) => i.name)))
  }, [])
  useEffect(refreshOrderAssets, [refreshOrderAssets])

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
        className="p-2 mb-3 w-full dark:text-white dark:bg-transparent rounded-lg border-none shadow-sm dark:bg-slate-800"
        type="text"
        placeholder="搜尋電話"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
      />

      <div className="flex gap-2">
        <div className="flex flex-1 gap-2 items-center mb-3 min-w-0">
          <ArrowLeftIcon
            className="w-5 h-5 cursor-pointer"
            onClick={() => setDateRange([addDays(dateRange[0], -1), addDays(dateRange[0], -1)])}
          />
          <Flatpickr
            options={{
              // @ts-expect-error
              position: "auto center",
              mode: "range",
              locale: MandarinTraditional,
            }}
            className="flex-1 min-w-0 font-bold leading-5 text-center bg-transparent border-none cursor-pointer"
            value={dateRange}
            onChange={(dateRange) => {
              if (!dateRange[0]) {
                return
              }
              setDateRange(dateRange as any)
            }}
          />
          <ArrowRightIcon
            className="w-5 h-5 cursor-pointer"
            onClick={() => setDateRange([addDays(dateRange[0], 1), addDays(dateRange[0], 1)])}
          />
          <button onClick={downloadOrdersOfDay} disabled={loadingDownloadOrdersOfDay}>
            {loadingDownloadOrdersOfDay ? (
              <Loader className="w-5 h-5 bg-black" />
            ) : (
              <DownloadIcon className="w-5 h-5 cursor-pointer" />
            )}
          </button>
          <RefreshIcon
            className={cn("w-5 h-5 cursor-pointer", isFetching && "animate-reverse-spin")}
            onClick={() => refetch()}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 my-2">
        {/* <OrderAssetsSlide /> */}
        <OrderStats dateRange={dateRange} />
        {/* <OrderCakes className="sm:hidden" dateRange={dateRange} /> */}
      </div>

      <div className="flex gap-2">
        {/* <OrderCakes className="max-sm:hidden" dateRange={dateRange} /> */}
        <div className="grid flex-1 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
