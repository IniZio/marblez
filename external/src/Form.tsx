import * as React from 'react';
import { gql } from 'apollo-boost';
import { get, set } from 'lodash';
import { run } from "tripetto-runner-classic";
import { Export, IDefinition, INode } from "tripetto-runner-foundation";
import Services from "tripetto-services";
import { useMutation } from 'react-apollo';

const { definition, styles, l10n, locale, translations, onSubmit } = Services.init({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoicmg1amlTWmNpMi9RVVFwc0JVODQ1TXlRcHpaOHpldUdpS0J5QTREaE9QRT0iLCJkZWZpbml0aW9uIjoiaDFETTNmM0JnMHN6YWlIL1RmYk5kTHAxZ3gxZUZDTnZ5L29TaTRKdW1iRT0iLCJ0eXBlIjoiY29sbGVjdCJ9.YCKVhrT5_v5RbPeMdGBgZZe6hXsfyFMpUAEjlcmm3fc" });

const CREATE_ORDER = gql`
  mutation createOrder($order: OrderInput!) {
    createOrder(order: $order) {
      id
    }
  }
`;

function Form({
  cake,
  ...props
}: {
  cake: string;
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
  const formRef = React.useRef<HTMLDivElement>(null);
  const formDefinitionRef = React.useRef<IDefinition>();
  React.useEffect(() => {
    definition.then(def => { formDefinitionRef.current = def; console.log('=== def', def) });
  }, [])

  const [snapshot, setSnapshot] = React.useState({"a":[{"a":"0bb27fb849172d746f09d1af06f1a3702318025c231b8bb5e4e7b32061fab6a7","b":[{"a":[{"a":"953817ae7981c1a1d1a0a69e06b0a3df4ce3e17d42837057c233dec228adff4d","b":1,"c":9,"d":1,"f":"684888c0ebb17f374298b65ee2807526c066094c701bcc7ebbe1c1095f494fc1"},{"a":"42e4be1c0290077089662c1163de73568871ff842199bac8680c431757416705","c":3,"d":1,"e":"953817ae7981c1a1d1a0a69e06b0a3df4ce3e17d42837057c233dec228adff4d","f":"ebef07c003034dace7a6e904e9444302dbcdaa92435018f6268e00292048f884","h":"684888c0ebb17f374298b65ee2807526c066094c701bcc7ebbe1c1095f494fc1","j":"106b2edc124d9c3a5dd5ecd291577938a8161867068fcaf3048688267859eec4","k":[{"a":"f5aa3f69f3e17a1092cf9b2402e0d8d5d61d7bc307818f5b5c5ba7bb8043a458","b":7},{"a":"f03a572dbdada5317e43d9be46a65e80a0fb2e71872c0fa48c5ef2fc3746dfb2","b":7}]}],"b":"42e4be1c0290077089662c1163de73568871ff842199bac8680c431757416705"}],"c":[{"a":"202fb09e1468b67bd24bc240973d2a6fceea825fa43b8dab58a0957f7b614d96","b":[{"a":"*","b":"雲石鏡面芝士凍餅系列","c":"163b253110e802fbe3439bd30fad9cc1e82f4c82f5800111e9f9028e3e5aef9d","d":1,"e":1609583442872}]}]}],"b":{"b":{"_08c32314f8f2a91e45946a3216d68b2005a63e5f488520d7cd67cdaff9dfd638":false},"e":1609583445950}});
  React.useEffect(
    () => {
      (async () => {
        const _definition = await definition;

        if (_definition) {
          const newSnapshot = {...snapshot};
          newSnapshot.a[0].c[0].b[0].b = cake;
          // @ts-ignore-next-line
          newSnapshot.a[0].c[0].b[0].c = _definition.clusters?.[0]?.nodes?.[0].block?.options?.find(({ value, name }) => [name, value].includes(cake))?.id || '';

          console.log('=== cake', newSnapshot.a[0].c[0].b[0].b, newSnapshot.a[0].c[0].b[0].c, _definition.clusters?.[0]?.nodes?.[0].block?.options)

          setSnapshot(newSnapshot);
        } 
      })()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cake],
  )

  const [createOrder] = useMutation(CREATE_ORDER);

  React.useEffect(
    () => {
      run({
        definition,
        styles,
        l10n,
        locale,
        translations,
        element: formRef.current, /* Or supply your own element here */
        onSubmit: async (...args) => {
            await onSubmit(...args);
          
            const [instance] = args;
            const nodeIdToNodeMap: { [index: string]: INode } = {};
            const exportables = Export.exportables(instance)
            formDefinitionRef.current?.clusters.forEach((cluster) => {
              cluster.nodes?.forEach(node => {
                nodeIdToNodeMap[node.id] = node;
              })
            })
            
            const orderInput = { createdAt: new Date(), attributes: {} };
            exportables.fields.forEach(({ name: _name, value: _value, datatype, node, type }) => {
              let name = _name;
              let value: any = _value;

              if (datatype === 'date') {
                value = new Date(value);
              }

              if (
                (type.includes('multiple') || type.includes('checkboxes'))
              ) {
                if (value === true) {
                  name = nodeIdToNodeMap[node.id].block?.alias as any || name;
                  value = (get(orderInput, name) || []).concat(_name);
                } else {
                  return;
                }
              }

              set(orderInput, name, value);
            })
            createOrder({ variables: { order: orderInput } })
              .then(console.log)
            return undefined
        },
        snapshot,
        // onPause: (snapshot) => {
        //     // TODO: Store the snapshot data somewhere
        // },
        persistent: false
      });
    },
    [createOrder, snapshot],
  );
  
  return (
    <div ref={formRef} {...props} />
  );
}

Form.defaultProps = {
  cake: '星空流心系列',
};

export default Form;
