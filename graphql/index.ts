export * from './models/Order';

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
