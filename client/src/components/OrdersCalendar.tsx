import { Box, Flex } from '@chakra-ui/react';
import { css, Global } from '@emotion/react';
import Calendar from '@toast-ui/react-calendar';
import { gql } from 'apollo-boost';
import { parse } from 'date-fns';
import React, { useMemo } from 'react';
import { useQuery } from 'react-apollo';
import 'tui-calendar/dist/tui-calendar.css';
import { useMediaLayout } from 'use-media';
import { FRAGMENT_ORDER } from '../apollo/fragments';
import DatePicker from './DatePicker';
import { order2Lines } from './Order';

const today = new Date();

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

function OrdersCalendar() {
  const [pickupDate, setPickupDate] = React.useState<Date>(new Date());  
  const calendarRef = React.useRef<Calendar>(null);

  const filter = useMemo(() => ({
    pickupMonth: pickupDate.getMonth(),
  }), [pickupDate]);
  const {data: { ordersOfMonth } = { }, loading, called} = useQuery(gql`
    query ordersOfMonth(
      $pickupMonth: Float
    ) {
      ordersOfMonth(
        pickupMonth: $pickupMonth
      ) {
        ...OrderAllFields
      }
    }
    ${FRAGMENT_ORDER}
  `, {
    pollInterval: 1000 * 60,
    // pollInterval: 1000 * 3,
    notifyOnNetworkStatusChange: true,
    variables: filter,
  });

  React.useEffect(
    () => {
      calendarRef.current?.getInstance().setDate(pickupDate);
    }, 
    [pickupDate]
  );

  const ordersAsEvents = useMemo(
    () => {
      if (!ordersOfMonth) {
        return []
      }

      return ordersOfMonth.filter(order => {
        if (!(order.date && isValidDate(new Date(order.date)))) {
          return false;
        }

        // try {
        //   parse(order.time.split('-')[0]?.trim()?.slice(0, 3).replace(/\D/g, ''), 'HHmm', new Date(order.date))?.toISOString();
        //   parse(order.time.split('-')[1]?.trim()?.slice(0, 3).replace(/\D/g, ''), 'HHmm', new Date(order.date))?.toISOString();
        // } catch {
        //   console.log(order.time)
          
        //   return false;
        // }

        return true;
      ).map((order, index) => ({
        id: index,
        calendarId: '0',
        title: `${order.cake} ${order.size}`,
        category: 'time',
        dueDateClass: '',
        start: parse(order.time.split('-')[0]?.trim()?.slice(0, 3).replace(/\D/g, ''), 'HHmm', new Date(order.date))?.toISOString(),
        end: parse(order.time.split('-')[1]?.trim()?.slice(0, 3).replace(/\D/g, ''), 'HHmm', new Date(order.date))?.toISOString(),
        rawTime: order.time,
        body:  order2Lines(order).join('\n'),
      }))
    }, 
    [ordersOfMonth]
  )

  const showFullCalendar = useMediaLayout({minWidth: '700px'});
  
  return (
    <Flex>
      <Global
        styles={css`
          .tui-full-calendar-popup-detail .tui-full-calendar-content {
            white-space: pre;
            line-break: anywhere;
          }
        `}
      />
      <Box flex={1}>
        <DatePicker value={pickupDate} onValue={setPickupDate} my={5} />
        <Calendar
          ref={calendarRef}
          defaultView="day"
          view={showFullCalendar ? 'month' : 'day'}
          height="900px"
          calendars={[
            {
              id: '0',
              name: 'Order',
              bgColor: '#transparent',
              borderColor: '#9e5fff'
            },
          ]}
          disableDblClick={true}
          disableClick={false}
          isReadOnly={true}
          month={{
            startDayOfWeek: 0
          }}
          schedules={ordersAsEvents}
          scheduleView={['time']}
          taskView={['task']}
          // template={{
          //   milestone(schedule) {
          //     return `<span style="color:#fff;background-color: ${schedule.bgColor};">${
          //       schedule.title
          //     }</span>`;
          //   },
          //   milestoneTitle() {
          //     return 'Milestone';
          //   },
          //   allday(schedule) {
          //     return `${schedule.title}<i class="fa fa-refresh"></i>`;
          //   },
          //   alldayTitle() {
          //     return 'All Day';
          //   }
          // }}
          timezones={[
            {
              timezoneOffset: 480,
              displayLabel: 'GMT+89:00',
              tooltip: 'HK'
            },
          ]}
          useDetailPopup={true}
          useCreationPopup={false}
          // view={selectedView} // You can also set the `defaultView` option.
          week={{
            showTimezoneCollapseButton: true,
            timezonesCollapsed: true,
            hourStart: 11,
            hourEnd: 21,
          }}
        />
      </Box>
    </Flex>
  );
}

export default OrdersCalendar
