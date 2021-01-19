import { differenceWith, xorWith } from 'lodash';
import { Arg, Args, FieldResolver, Mutation, Query, Resolver, Root } from "type-graphql";
import randomColor from 'randomcolor'

import { Order } from "../entities/order";
import { OrderLabel, OrderLabelModel } from '../entities/order_label';
import { OrderMeta, OrderMetaModel } from '../entities/order_meta';
import { OrderLabelsInput, OrderMetaInput } from './types/order-input';



@Resolver(of => OrderMeta)
export class OrderMetaResolver {
  @Query(returns => [OrderLabel], { nullable: true })
  async orderLabels() {
    return OrderLabelModel.find({})
  }

  @Mutation(returns => [OrderLabel])
  async saveOrderLabels (
    @Arg('orderLabelsInput') orderlabelsInput: OrderLabelsInput
  ) {
    const updatedLabels = await Promise.all(orderlabelsInput.labels.map(async label => {
      const updatedLabel = 
          (label._id && await OrderLabelModel.findById(label._id)) || new OrderLabelModel();

      if (await OrderLabelModel.findOne({
        name: label.name,
        _id: { $ne: label._id }
      })) {
        return null;
      }

      updatedLabel.name = label.name;
      updatedLabel.color = label.color || randomColor();
      updatedLabel.conditions = label.conditions;

      return updatedLabel
    }))

    const labels = await Promise.all(updatedLabels.filter(Boolean).map(label => label.save()))

    return labels
  }
  
  @Mutation(returns => OrderMeta)
  async saveOrderMeta(
    @Arg('orderMetaInput') orderMetaInput: OrderMetaInput
  ) {
    const updatedLabels = await Promise.all(orderMetaInput.labels.map(async label => {
      const updatedLabel = 
          (label._id && await OrderLabelModel.findById(label._id)) || new OrderLabelModel();

      updatedLabel.name = label.name;
      updatedLabel.color = label.color || randomColor();
      updatedLabel.conditions = label.conditions;

      return updatedLabel
    }))

    const labels = await Promise.all(updatedLabels.map(label => label.save()))

    const updatedOrderMeta = 
        await OrderMetaModel.findOne({ orderId: orderMetaInput.orderId }) 
        || new OrderMetaModel();

    updatedOrderMeta.orderId = orderMetaInput.orderId;
    updatedOrderMeta.labels = labels;

    return updatedOrderMeta.save();
  }

}
