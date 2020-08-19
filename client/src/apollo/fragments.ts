import gql from 'graphql-tag';

export const FRAGMENT_ORDER = gql`
    fragment OrderAllFields on Order {
      paid
      created_at
      name
      phone
      date
      time
      cake
      letter
      taste
      inner_taste
      bottom_taste
      size
      shape
      color
      sentence
      paid_sentence
      toppings
      decorations
      social_name
      order_from
      delivery_method
      delivery_address
      remarks
      printed
    }
`;
