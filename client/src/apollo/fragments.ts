import gql from 'graphql-tag';

export const FRAGMENT_ORDER = gql`
    fragment OrderAllFields on Order {
      row
      paid
      customerName
      customerPhone
      customerSocialChannel
      customerSocialName
      deliveryDate
      receivedAt
      deliveryTime
      otherAttributes
      deliveryMethod
      deliveryAddress
      remarks
    }
`;
