import { useQuery } from "blitz"
import classNames from "clsx"
import { endOfDay, startOfDay } from "date-fns"
import { groupBy } from "lodash"
import { FC, useMemo } from "react"
import Loader from "../../primitives/Loader"
import getOrders from "../queries/getOrders"

export interface OrderCakesProps {
  className?: string
  dateRange: [Date, Date]
}

const OrderCakes: FC<OrderCakesProps> = ({ className, dateRange }: OrderCakesProps) => {
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

  const ordersGroupByCake = useMemo(
    () =>
      groupBy(
        orders,
        ({ otherAttributes }) =>
          `${(otherAttributes as any).cake}|||${(otherAttributes as any).size}`
      ),
    [orders]
  )

  return (
    <div
      className={classNames(
        "p-4 rounded-lg dark:bg-slate-800 sm:w-[300px] sm:max-w-[300px]",
        className
      )}
    >
      <h3 className="font-bold">蛋糕數</h3>
      {isLoading ? (
        <Loader className="h-5 w-5" />
      ) : (
        <ul>
          {Object.entries(ordersGroupByCake).map(([cake, orders]) => (
            <li key={cake} className="flex">
              <label>{cake.split("|||")[0]}</label>
              <div className="min-w-[4px] flex-1 shrink-0" />{" "}
              <label className="mr-2">{cake.split("|||")[1]}</label>
              <span className="min-w-[20px] shrink-0"> x {orders.length}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default OrderCakes
