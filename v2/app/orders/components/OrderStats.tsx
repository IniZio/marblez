import { useQuery } from "@blitzjs/core"
import { endOfDay, startOfDay } from "date-fns"
import Loader from "../../primitives/Loader"
import getOrders from "../queries/getOrders"

export interface OrderStatsProps {
  dateRange: [Date, Date]
}

function OrderStats({ dateRange }: OrderStatsProps) {
  const [orders, { isLoading }] = useQuery(
    getOrders,
    {
      where: {
        deliveryDate: {
          gte: startOfDay(dateRange[0] || dateRange[1]),
          lt: endOfDay(dateRange[1] || dateRange[0]),
        },
      },
    },
    {
      suspense: false,
    }
  )

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-slate-800">
      <h3 className="font-bold">訂單數</h3>
      <div>{isLoading ? <Loader className="h-5 w-5" /> : orders?.length}</div>
    </div>
  )
}

export default OrderStats
