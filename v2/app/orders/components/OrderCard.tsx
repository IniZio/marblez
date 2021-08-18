import { Order } from '@prisma/client';
import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { format, parseISO, isValid } from "date-fns"

export interface OrderProps {
  order?: Order;
  onUpdate?: () => any;
}

function get(obj: any, path: string, defValue: any = undefined) {
  // If path is not defined or it has false value
  if (!path) return undefined
  // Check if path is string or array. Regex : ensure that we do not have '.' and brackets.
  // Regex explained: https://regexr.com/58j0k
  const pathArray = Array.isArray(path) ? path : (path as unknown as string).match(/([^[.\]])+/g)
  // Find value if exist return otherwise return undefined value;
  return (
    pathArray?.reduce((prevObj: any, key: string) => prevObj && prevObj[key], obj as any) || defValue
  )
}


function lineIf<T extends Order>(o: any, fields: any, opt: any = {}) {
  if (!o || !fields) {
    return null;
  }

  const lineArr = (
    fields
    .map(function(f, i) {
      if (!f) {
        return null;
      }

      const value = get(o, f);

      if (!value) {
        return null;
      }

      if (opt && opt.overrides && opt.overrides[i]) {
        return opt.overrides[i](get(o, f))
      }
      if (f === 'deliveryDate' && o[f]) {
        if (o[f]) {
          return format(o[f], 'MM/dd');
        }
        return "";
      }

      if (['otherAttributes.cake', 'otherAttributes.shape', 'otherAttributes.color', 'otherAttributes.taste', 'otherAttributes.letter'].includes(f)) {
        return <b>{get(o, f)?.replace(/\([^(\))]*\)/g, '')}</b>
      }

      return get(o, f)
    })
    .filter(Boolean)
  )

  return (
    lineArr.length > 0 ? <div>{(opt && opt.prefix) || ''} {lineArr}</div> : ''
  );
}

export const order2Lines = (order: any) => [
  lineIf(order, ['customerName', 'customerPhone'], {prefix: '👨 '}),
  lineIf(order, ['deliveryDate', 'deliveryTime'], {prefix: '🕐 '}),
  lineIf(order, ['otherAttributes.cake', 'otherAttributes.size'], {prefix: '🎂 '}),
  lineIf(order, ['otherAttributes.decorations', 'otherAttributes.toppings'], {prefix: '📿 '}),
  lineIf(order, ['otherAttributes.shape', 'otherAttributes.color'], {prefix: '‎‎‎⠀⠀ '}),
  lineIf(order, ['otherAttributes.taste', 'otherAttributes.letter'], {prefix: '‎‎⠀⠀ '}),
  lineIf(order, ['otherAttributes.innerTaste', 'otherAttributes.bottomTaste'], {prefix: '‎‎⠀⠀ '}),
  lineIf(order, ['otherAttributes.sentence'], {prefix: '✍️️ '}),
  lineIf(order, ['otherAttributes.paidSentence'], {prefix: '🍫️ '}),
  lineIf(order, ['customerSocialChannel', 'customerSocialName'], {prefix: '📲 '}),
  lineIf(order, ['deliveryMethod', 'deliveryAddress'], {prefix: '🚚 '}),
  lineIf(order, ['remarks']),
].filter(Boolean)

function OrderCard({ order, onUpdate = () => {} }: OrderProps) {
  const lines = useMemo(() => order2Lines(order), [order]);

  return (
    <div className="w-full overflow-hidden rounded p-3 border text-gray-700">
      <div>
        {lines}
      </div>
    </div>
  )
}

export default OrderCard;
