export type IOrder = {
  row: number;
  receivedAt?: Date;
  paid: boolean;

  customerName?: string;
  customerPhone?: string;
  customerSocialName?: string;
  customerSocialChannel?: string;

  deliveryDate?: Date;
  deliveryTime?: string;
  deliveryMethod?: string;
  deliveryAddress?: string;

  remarks?: string;

  otherAttributes: {
    cake: string;
    letter?: string;
    taste?: string;
    innerTaste?: string;
    bottomTaste?: string;
    size?: string;
    shape?: string;
    color?: string;
    sentence?: string;
    paidSentence?: string;
    decorations?: string[];
    toppings?: string[];
    printed?: string;
    printedReceipt?: string;
  }
}
