import { useInfiniteQuery } from "@blitzjs/core"
import Image from "next/image"
import { FC, useMemo } from "react"
import HorizontalInfiniteScroll from "../../primitives/HorizontalInfiniteScroll"
import Loader from "../../primitives/Loader"
import getAssets from "../queries/getAssets"

const ITEMS_PER_PAGE = 20

const OrderAssetsSlide: FC = () => {
  const where = useMemo(
    () => ({
      bucketName: "order-assets",
    }),
    []
  )

  const [assetPages, { fetchNextPage, hasNextPage, isFetching }] = useInfiniteQuery(
    getAssets,
    (page = { take: ITEMS_PER_PAGE, skip: 0, where }) => page,
    {
      getNextPageParam: (lastPage) => ({ ...lastPage.nextPage, where }),
      suspense: false,
    }
  )

  return (
    <HorizontalInfiniteScroll
      mainWrapper={<div className="max-w-full" />}
      loader={<div />}
      dipatchScroll={hasNextPage && fetchNextPage}
    >
      <div className="flex gap-2">
        {assetPages?.map((assetPage) => (
          <>
            {assetPage.assets.map((asset) => (
              <img
                alt={asset.bucketKey}
                key={asset.id}
                width="45"
                height="45"
                className="w-[45px] h-[45px] rounded-full"
                src={`${process.env.ORDER_ASSETS_CDN_URL}/${asset.bucketKey}`}
              />
            ))}
          </>
        ))}
        {isFetching && <Loader className="w-[45px] h-[45px] bg-black" />}
      </div>
    </HorizontalInfiniteScroll>
  )
}

export default OrderAssetsSlide
