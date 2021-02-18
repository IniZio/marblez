import gql from 'graphql-tag';

export const FRAGMENT_ORDER = gql`
    fragment OrderAllFields on Order {
      id
      paid
      customerName
      customerPhone
      customerSocialChannel
      customerSocialName
      deliveryDate
      createdAt
      deliveryTime
      otherAttributes
      deliveryMethod
      deliveryAddress
      remarks
    }
`;
