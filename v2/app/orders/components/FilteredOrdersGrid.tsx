import getOrders from "app/orders/queries/getOrders";
import {
  Link, Routes, useInfiniteQuery, useMutation
} from "blitz";
import { noop } from 'lodash';
import { useState, useMemo, useCallback } from 'react';
import 'flatpickr/dist/themes/airbnb.css'
import Flatpickr from "react-flatpickr";
import { ArrowLeftIcon, ArrowRightIcon, RefreshIcon, DownloadIcon } from "@heroicons/react/solid";
import cn from "classnames";

import OrderCard from './OrderCard'
import { startOfDay, endOfDay, addDays, format } from "date-fns";
import useDebouncedValue from '../../hooks/useDebouncedValue';
import downloadOrders from "../mutations/downloadOrders";
import { downloadURI } from '../../util/dom';
import Loader from '../../primitives/Loader';

const ITEMS_PER_PAGE = 10;

const FilteredOrdersGrid = () => {
  const [date, setDate] = useState(new Date());
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebouncedValue(keyword, 500);

  const where = useMemo(() => (
    {
      deliveryDate: { gte: startOfDay(date), lt: endOfDay(date) },
      OR: [
        { customerPhone: { contains: debouncedKeyword, mode: 'insensitive' } },
        { customerName: { contains: debouncedKeyword, mode: 'insensitive' } },
        { customerSocialName: { contains: debouncedKeyword, mode: 'insensitive' } },
      ]
    }
  ), [debouncedKeyword, date])

  const [
    orderPages,
    { fetchNextPage, hasNextPage, refetch, isFetching },
  ] = useInfiniteQuery(
    getOrders,
    (page = { take: ITEMS_PER_PAGE, skip: 0, where }) => page,
    {
      getNextPageParam: (lastPage) => lastPage.nextPage,
      suspense: false,
    }
  )

  const [loadingDownloadOrdersOfDay, setLoadingDownloadOrdersOfDay] = useState(false);
  const [downloadOrdersMutation] = useMutation(downloadOrders);

  const downloadOrdersOfDay = useCallback(async (event) => {
    event?.preventDefault();

    setLoadingDownloadOrdersOfDay(true);
    try {
      const linkToOrdersOfDay = await downloadOrdersMutation({ date });
      downloadURI(linkToOrdersOfDay, `Orders of ${format(date, 'M_d')}.pdf`);
    } catch {}
    setLoadingDownloadOrdersOfDay(false);
  }, [date, downloadOrdersMutation])

  return (
    <div className="m-3">
      <input className="mb-3 w-full p-2 border rounded" type="text" placeholder="搜尋電話" value={keyword} onChange={event => setKeyword(event.target.value)} />

      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 mb-3 min-w-0">
          <ArrowLeftIcon className="cursor-pointer w-5 h-5" onClick={() => setDate(addDays(date, -1))} />
          {/* @ts-expect-error */}
          <Flatpickr options={{ position: "auto center" }} className="cursor-pointer min-w-0 flex-1 leading-5 font-bold text-center" value={date} onChange={([date]) => {
              if (!date) {
                return;
              }
              setDate(date);
            }} />
          <ArrowRightIcon className="cursor-pointer w-5 h-5" onClick={() => setDate(addDays(date, 1))} />
          <button onClick={downloadOrdersOfDay} disabled={loadingDownloadOrdersOfDay}>
            {loadingDownloadOrdersOfDay ? <Loader className="w-5 h-5 bg-black" /> : <DownloadIcon className="cursor-pointer w-5 h-5" />}
          </button>
        </div>
        <RefreshIcon className={cn("h-5 w-5 cursor-pointer", isFetching && "animate-reverse-spin")} onClick={() => refetch()} />
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
  );
};

export default FilteredOrdersGrid;
