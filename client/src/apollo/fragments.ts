import { gql } from 'apollo-boost';

export const FRAGMENT_ORDER = gql`
    fragment OrderAllFields on Order {
      paid
      name
      phone
      date
      time
      cake
      letter
      taste
      size
      shape
      color
      sentence
      decorations
      social_name
      order_from
      delivery_method
      delivery_address
      remarks
    }
`;
