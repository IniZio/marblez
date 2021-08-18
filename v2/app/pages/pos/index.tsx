import { BlitzPage } from 'blitz';
import React from 'react';
import Layout from '../../core/layouts/Layout';
import FilteredOrdersGrid from '../../orders/components/FilteredOrdersGrid';

const POSHomePage: BlitzPage = () => {
  return (
    <FilteredOrdersGrid />
  );
}

POSHomePage.authenticate = false;
POSHomePage.getLayout = (page) => <Layout>{page}</Layout>;


export default POSHomePage
