import { Button } from '@chakra-ui/react';
import { gql } from "apollo-boost";
import React, { FC } from "react";
import { useQuery } from "react-apollo";
import DecrementButton from "./DecrementButton";
import IncrementButton from "./IncrementButton";


const Counter: FC = () => {
  // const { data, loading } = useQuery<{ counter: CounterType }>(gql`
  //   query {
  //     counter @client {
  //       value
  //     }
  //   }
  // `);
  
  const {data, loading} = useQuery(gql`
    query {
      orders {
        name
        date
      }
    }
  `)

  return (
    <>
      <h1>Counter:</h1>
      <Button>chak</Button>
      {MAGIC}
      <h2>{loading ? "Loading..." : JSON.stringify(data)}</h2>
      <IncrementButton />
      <DecrementButton />
    </>
  );
};

export default Counter;
