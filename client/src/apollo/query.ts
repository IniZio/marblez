import gql from 'graphql-tag';

import { FRAGMENT_ORDER } from './fragments';

export const QUERY_NOTIFICATIONS_OF_DAY = gql`
  query {
    notificationsOfDay{
      orders {
        ...OrderAllFields
      }
      event
    }
  }
  ${FRAGMENT_ORDER}
`
