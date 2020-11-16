import React, { useMemo } from 'react';
import Calendar from '@toast-ui/react-calendar';
import 'tui-calendar/dist/tui-calendar.css';
import { addDays } from 'date-fns/esm';
import { addHours, isValid, parse, parseISO } from 'date-fns';
import { Flex, Box } from '@chakra-ui/core';
import DatePicker from './DatePicker';
import { useQuery } from 'react-apollo';
import { gql } from 'apollo-boost';
import { FRAGMENT_ORDER } from '../apollo/fragments';
import { order2Lines } from './Order';
import { Global, css } from '@emotion/core';

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

      console.log('=== ordesr of month',  ordersOfMonth.filter(order => order.date && isValidDate(new Date(order.date))).map(o => o.time.split('-')[0]?.trim()?.replace(/\D/g, '')))

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
        title: order.cake,
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
      <Box padding={5} flex={1}>
        <DatePicker value={pickupDate} onValue={setPickupDate} my={5} />
        <Calendar
          ref={calendarRef}
          defaultView="month"
          view="month"
          height="900px"
          calendars={[
            {
              id: '0',
              name: 'Order',
              bgColor: '#9e5fff',
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
          // scheduleView
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
            timezonesCollapsed: true
          }}
        />
      </Box>
    </Flex>
  );
}

export default OrdersCalendar
