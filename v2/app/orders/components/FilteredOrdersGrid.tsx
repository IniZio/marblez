import { ArrowLeftIcon, ArrowRightIcon, DownloadIcon, RefreshIcon } from "@heroicons/react/solid"
import getOrders from "app/orders/queries/getOrders"
import { useInfiniteQuery, useMutation } from "blitz"
import cn from "classnames"
import { addDays, endOfDay, format, startOfDay } from "date-fns"
import "flatpickr/dist/themes/airbnb.css"
import { useCallback, useMemo, useState } from "react"
import Flatpickr from "react-flatpickr"
import useDebouncedValue from "../../hooks/useDebouncedValue"
import Loader from "../../primitives/Loader"
import { downloadURI } from "../../util/dom"
import downloadOrders from "../mutations/downloadOrders"
import OrderCard from "./OrderCard"

const ITEMS_PER_PAGE = 10

const FilteredOrdersGrid = () => {
  const [date, setDate] = useState(new Date())
  const [keyword, setKeyword] = useState("")
  const debouncedKeyword = useDebouncedValue(keyword, 500)

  const where = useMemo(
    () => ({
      deliveryDate: { gte: startOfDay(date), lt: endOfDay(date) },
      OR: [
        { customerPhone: { contains: debouncedKeyword, mode: "insensitive" } },
        { customerName: { contains: debouncedKeyword, mode: "insensitive" } },
        { customerSocialName: { contains: debouncedKeyword, mode: "insensitive" } },
      ],
    }),
    [debouncedKeyword, date]
  )

  const [orderPages, { fetchNextPage, hasNextPage, refetch, isFetching }] = useInfiniteQuery(
    getOrders,
    (page = { take: ITEMS_PER_PAGE, skip: 0, where }) => page,
    {
      getNextPageParam: (lastPage) => lastPage.nextPage,
      suspense: false,
    }
  )

  const [loadingDownloadOrdersOfDay, setLoadingDownloadOrdersOfDay] = useState(false)
  const [downloadOrdersMutation] = useMutation(downloadOrders)

  const downloadOrdersOfDay = useCallback(
    async (event) => {
      event?.preventDefault()

      setLoadingDownloadOrdersOfDay(true)
      try {
        const linkToOrdersOfDay = await downloadOrdersMutation({ date })
        downloadURI(linkToOrdersOfDay, `Orders of ${format(date, "M_d")}.pdf`)
      } catch {}
      setLoadingDownloadOrdersOfDay(false)
    },
    [date, downloadOrdersMutation]
  )

  return (
    <div className="m-3">
      <input
        className="p-2 mb-3 w-full rounded border"
        type="text"
        placeholder="搜尋電話"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
      />

      <div className="flex gap-2">
        <div className="flex flex-1 gap-2 items-center mb-3 min-w-0">
          <ArrowLeftIcon
            className="w-5 h-5 cursor-pointer"
            onClick={() => setDate(addDays(date, -1))}
          />
          <Flatpickr
            // @ts-expect-error
            options={{ position: "auto center" }}
            className="flex-1 min-w-0 font-bold leading-5 text-center cursor-pointer"
            value={date}
            onChange={([date]) => {
              if (!date) {
                return
              }
              setDate(date)
            }}
          />
          <ArrowRightIcon
            className="w-5 h-5 cursor-pointer"
            onClick={() => setDate(addDays(date, 1))}
          />
          <button onClick={downloadOrdersOfDay} disabled={loadingDownloadOrdersOfDay}>
            {loadingDownloadOrdersOfDay ? (
              <Loader className="w-5 h-5 bg-black" />
            ) : (
              <DownloadIcon className="w-5 h-5 cursor-pointer" />
            )}
          </button>
        </div>
        <RefreshIcon
          className={cn("w-5 h-5 cursor-pointer", isFetching && "animate-reverse-spin")}
          onClick={() => refetch()}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {orderPages?.map(({ orders }) => (
          <>
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </>
        ))}
      </div>

      {hasNextPage && !isFetching && (
        <button disabled={!hasNextPage} onClick={() => fetchNextPage()}>
          Load More
        </button>
      )}
    </div>
  )
}

export default FilteredOrdersGrid
