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
  onSubmit: _onSubmit,
  ...props
}: {
  cake: string;
  onSubmit: () => any;
}) {
  const formRef = React.useRef<HTMLDivElement>(null);
  const formDefinitionRef = React.useRef<IDefinition>();
  React.useEffect(() => {
    definition.then(def => { formDefinitionRef.current = def; console.log('=== def', def) });
  }, [])

  const [snapshot, setSnapshot] = React.useState({"a":[{"a":"4fd665129084743b726c2d8a3a91ac9e2dc4b38cc307c4080024aeabd863151a","b":[{"a":[{"a":"4315d1b91f7c26f10875234048aaacc492454842e37f14e01a55c04ca8ddcc56","b":1,"c":9,"d":1,"f":"684888c0ebb17f374298b65ee2807526c066094c701bcc7ebbe1c1095f494fc1"},{"a":"bf51be883cc67e8fb05247c0ca48f84c960ce4591d7b20b6aec5c609ea5b1c56","c":3,"d":1,"e":"4315d1b91f7c26f10875234048aaacc492454842e37f14e01a55c04ca8ddcc56","f":"ebef07c003034dace7a6e904e9444302dbcdaa92435018f6268e00292048f884","h":"684888c0ebb17f374298b65ee2807526c066094c701bcc7ebbe1c1095f494fc1","j":"106b2edc124d9c3a5dd5ecd291577938a8161867068fcaf3048688267859eec4","k":[{"a":"f5aa3f69f3e17a1092cf9b2402e0d8d5d61d7bc307818f5b5c5ba7bb8043a458","b":7},{"a":"f03a572dbdada5317e43d9be46a65e80a0fb2e71872c0fa48c5ef2fc3746dfb2","b":7}]}],"b":"bf51be883cc67e8fb05247c0ca48f84c960ce4591d7b20b6aec5c609ea5b1c56"},{"a":[{"a":"4315d1b91f7c26f10875234048aaacc492454842e37f14e01a55c04ca8ddcc56","b":1,"c":9,"d":1,"f":"684888c0ebb17f374298b65ee2807526c066094c701bcc7ebbe1c1095f494fc1"},{"a":"bf51be883cc67e8fb05247c0ca48f84c960ce4591d7b20b6aec5c609ea5b1c56","b":1,"c":9,"d":1,"e":"4315d1b91f7c26f10875234048aaacc492454842e37f14e01a55c04ca8ddcc56","f":"ebef07c003034dace7a6e904e9444302dbcdaa92435018f6268e00292048f884","h":"684888c0ebb17f374298b65ee2807526c066094c701bcc7ebbe1c1095f494fc1","j":"106b2edc124d9c3a5dd5ecd291577938a8161867068fcaf3048688267859eec4","k":[{"a":"f5aa3f69f3e17a1092cf9b2402e0d8d5d61d7bc307818f5b5c5ba7bb8043a458","b":7},{"a":"f03a572dbdada5317e43d9be46a65e80a0fb2e71872c0fa48c5ef2fc3746dfb2","b":7}]},{"a":"a8e65f93f487acd212c61712b40746d36ee806ecbc8cea8b4ce68d21c6154ff4","c":3,"d":1,"e":"bf51be883cc67e8fb05247c0ca48f84c960ce4591d7b20b6aec5c609ea5b1c56","f":"9a87bbef27ecf02fdece990a12d89cd9100324ed82388e1d94bfce191e2e630a","h":"1e6500fe1aa76a53e5a89e2835545acf7bd824aab651b8adb83652ae9e636abf","j":"106b2edc124d9c3a5dd5ecd291577938a8161867068fcaf3048688267859eec4","k":[{"a":"792aacb6fb533385d01a6daf5e9c8131122e9a09ba9efdac00c65c6089a34c69","b":7},{"a":"88dc1d8b8c2d96f5231fbb919a1626712f9cb20713f7bcd1b1120a459192beb9","b":7}]}],"b":"a8e65f93f487acd212c61712b40746d36ee806ecbc8cea8b4ce68d21c6154ff4"}],"c":[{"a":"6afc617e2d6ef10c65cad42a005e9c075319abe9d63367afb8a348a8d7bf3524","b":[{"a":"*","b":"海鹽流心系列","c":"eea8e10e8737e68828cc7fadb52bd411b937077767cd12f5b40214f1d2cc1a0a","d":1,"e":1609676247979}]},{"a":"00ba5b9a57079eca0e9a5502c59ba0a92d474ef8640088bd68f95ef2d558b420","b":[{"a":"*","d":1}]}]}],"b":{"b":{"_08c32314f8f2a91e45946a3216d68b2005a63e5f488520d7cd67cdaff9dfd638":false,"_8530655688605f1544bf8ae8d67f8480fff03650cc88be008ccfeb462369ce7e":false},"e":1609676336356}});
  React.useEffect(
    () => {
      (async () => {
        const _definition = await definition;

        if (_definition) {
          const newSnapshot = {...snapshot};
          (newSnapshot.a[0].c[0].b[0] as any).b = cake;
          // // // @ts-ignore-next-line
          (newSnapshot.a[0].c[0].b[0] as any).c = (_definition.clusters?.[0]?.nodes?.[0].block?.options as any)?.find(({ value, name }: { value: any; name: string }) => [name, value].includes(cake))?.id || '';

          // console.log('=== cake', newSnapshot.a[0].c[0].b[0].b, newSnapshot.a[0].c[0].b[0].c, _definition.clusters?.[0]?.nodes?.[0].block?.options)

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
            
            const orderInput = { createdAt: new Date(), otherAttributes: {} };
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
            await createOrder({ variables: { order: orderInput } })
            await _onSubmit();
            return undefined
        },
        snapshot,
        // onPause: (snapshot) => {
        //     // TODO: Store the snapshot data somewhere
        // },
        persistent: false
      });
    },
    [_onSubmit, createOrder, snapshot],
  );
  
  return (
    <div ref={formRef} {...props} />
  );
}

export default Form;
