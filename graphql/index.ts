export * from './models/Order';
export * from './models/OrderLabel';

export type NestedObjectType = {
  a?: string;
  b?: string;
  nest?: {
      c?: string;
  };
  otherNest?: {
      c: string;
  };
};
