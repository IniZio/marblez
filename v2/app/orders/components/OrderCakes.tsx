import { useQuery } from "blitz"
import classNames from "classnames"
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
  const [ordersPage, { isLoading }] = useQuery(
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
    () => groupBy(ordersPage?.orders, "otherAttributes.cake"),
    [ordersPage]
  )

  return (
    <div className={classNames("p-4 rounded border sm:max-w-[250px]", className)}>
      <h3 className="font-bold">蛋糕數</h3>
      {isLoading ? (
        <Loader className="w-5 h-5" />
      ) : (
        <ul>
          {Object.entries(ordersGroupByCake).map(([cake, orders]) => (
            <li key={cake} className="flex">
              <span>{cake}</span> <div className="flex-1 flex-shrink-0 min-w-[4px]" />{" "}
              <span className="flex-shrink-0 min-w-[20px]"> x {orders.length}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default OrderCakes
