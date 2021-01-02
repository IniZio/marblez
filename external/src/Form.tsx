import * as React from 'react';

import { run } from "tripetto-runner-classic";
import { Export } from "tripetto-runner-foundation";
import Services from "tripetto-services";

const { definition, styles, l10n, locale, translations, onSubmit } = Services.init({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoicmg1amlTWmNpMi9RVVFwc0JVODQ1TXlRcHpaOHpldUdpS0J5QTREaE9QRT0iLCJkZWZpbml0aW9uIjoiaDFETTNmM0JnMHN6YWlIL1RmYk5kTHAxZ3gxZUZDTnZ5L29TaTRKdW1iRT0iLCJ0eXBlIjoiY29sbGVjdCJ9.YCKVhrT5_v5RbPeMdGBgZZe6hXsfyFMpUAEjlcmm3fc" });


function Form({
  cake
}: {
  cake: string;
}) {
  const formRef = React.useRef<HTMLDivElement>(null);

  const [snapshot, setSnapshot] = React.useState({"a":[{"a":"fdbc6f0570fb2d74dd53fc634410670deaaffae6e201634aa384e8f71ba4aef7","b":[{"a":[{"a":"7132dadaee68a24eb527567a276d05cdf030da793f4da91a5e108dcf5f8017a3","b":1,"c":9,"d":1,"f":"684888c0ebb17f374298b65ee2807526c066094c701bcc7ebbe1c1095f494fc1"},{"a":"68645a80284ecec7434415610cce7eadb4ffbc048e498d23cc67a8c586b8e78d","c":3,"d":1,"e":"7132dadaee68a24eb527567a276d05cdf030da793f4da91a5e108dcf5f8017a3","f":"ebef07c003034dace7a6e904e9444302dbcdaa92435018f6268e00292048f884","h":"684888c0ebb17f374298b65ee2807526c066094c701bcc7ebbe1c1095f494fc1","k":[{"a":"f5aa3f69f3e17a1092cf9b2402e0d8d5d61d7bc307818f5b5c5ba7bb8043a458","b":7},{"a":"f03a572dbdada5317e43d9be46a65e80a0fb2e71872c0fa48c5ef2fc3746dfb2","b":7}]}],"b":"68645a80284ecec7434415610cce7eadb4ffbc048e498d23cc67a8c586b8e78d"}],"c":[{"a":"202fb09e1468b67bd24bc240973d2a6fceea825fa43b8dab58a0957f7b614d96","b":[{"a":"*","b":"海鹽流心系列","c":"817d44ed24d16e3b8c1ea47856594cdf258a853477820a9fc78ced78ea1289ff","d":1,"e":1609516948354}]}]}],"b":{"b":{"_08c32314f8f2a91e45946a3216d68b2005a63e5f488520d7cd67cdaff9dfd638":false},"e":1609516967956}});
  React.useEffect(
    () => {
      (async () => {
        const _definition = await definition;

        if (_definition) {
          const newSnapshot = {...snapshot};
          newSnapshot.a[0].c[0].b[0].b = cake;
          // @ts-ignore-next-line
          newSnapshot.a[0].c[0].b[0].c = _definition.clusters?.[0]?.nodes?.[0].block?.options?.find(({ value, name }) => [name, value].includes(cake))?.id || '';
          setSnapshot(newSnapshot);
        } 
      })()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cake],
  )

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
            // TODO: Handle the results
            // For example retrieve the results as a CSV-file:
            // const csv = Export.CSV(instance);
            // Or retrieve the individual fields:
            const fields = Export.fields(instance);
            const values = Export.values(instance)
            console.log('=== values', values, fields);

            return undefined
        },
        snapshot,
        // onPause: (snapshot) => {
        //     // TODO: Store the snapshot data somewhere
        // },
        persistent: false
      });
    },
    [snapshot],
  )
  
  return (
    <div ref={formRef} />
  );
}

Form.defaultProps = {
  cake: '鑽石心型芝士凍餅系列',
};

export default Form;
