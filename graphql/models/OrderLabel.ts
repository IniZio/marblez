export interface IMaterial {
  _id: any;
  name?: string;
}


export interface IOrderLabelCondition {
  keyword?: string,
}

export type IOrderLabel = {
  _id: any;
  name?: string;
  color?: string;
  conditions: IOrderLabelCondition[];
  materials: IMaterial[]
}
