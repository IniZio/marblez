import { useQuery } from "@blitzjs/core"
import { addDays, endOfDay, startOfDay } from "date-fns"
import Loader from "../../primitives/Loader"
import getOrders from "../queries/getOrders"

export interface OrderStatsProps {
  date: Date
}

function OrderStats({ date }: OrderStatsProps) {
  const [ordersOfToday, { isLoading: ordersOfTodayIsLoading }] = useQuery(
    getOrders,
    {
      where: {
        deliveryDate: { gte: startOfDay(date), lt: endOfDay(date) },
      },
    },
    {
      suspense: false,
    }
  )

  const [ordersOfTomorrow, { isLoading: ordersOfTomorrowIsLoading }] = useQuery(
    getOrders,
    {
      where: {
        deliveryDate: { gte: startOfDay(addDays(date, 1)), lt: endOfDay(addDays(date, 1)) },
      },
    },
    {
      suspense: false,
    }
  )

  return (
    <div className="flex p-4 my-2 rounded border">
      <div className="flex-1">
        <label>今天訂單數</label>
        <div>{ordersOfTodayIsLoading ? <Loader className="w-5 h-5" /> : ordersOfToday?.count}</div>
      </div>
      <div className="flex-1">
        <label>明天訂單數</label>
        <div>
          {ordersOfTomorrowIsLoading ? <Loader className="w-5 h-5" /> : ordersOfTomorrow?.count}
        </div>
      </div>
    </div>
  )
}

export default OrderStats
