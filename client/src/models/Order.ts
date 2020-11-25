export interface Order {
  index?: string;
  paid: boolean;
  name?: string;
  phone?: string;
  date?: Date;
  created_at?: Date;
  time?: string;
  cake?: string;
  letter?: string;
  taste?: string;
  inner_taste?: string;
  bottom_taste?: string;
  size?: string;
  shape?: string;
  color?: string;
  sentence?: string;
  paid_sentence?: string;
  decorations?: string[];
  toppings?: string[];
  social_name?: string;
  order_from?: string;
  delivery_method?: string;
  delivery_address?: string;
  remarks?: string;
  printed?: string;
}
