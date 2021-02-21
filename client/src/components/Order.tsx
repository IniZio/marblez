import { AddIcon, DeleteIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { Badge, Box, Button, Checkbox, css, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, Flex, FormControl, FormLabel, IconButton, Input, Portal, Stack, Textarea, useDisclosure } from '@chakra-ui/react';
import styled from '@emotion/styled';
import { gql } from 'apollo-boost';
import { format, parseISO } from 'date-fns';
import { Field, FieldArray, Formik } from 'formik';
import { capitalize, map } from 'lodash';
import { omit } from 'lodash/fp';
import React, { useCallback, useMemo, useRef, useState, useEffect, memo } from 'react';
import { useMutation, useQuery } from 'react-apollo';
import { FaFileDownload } from '@react-icons/all-files/fa/FaFileDownload';
import { RemoveScroll } from 'react-remove-scroll';
import SocialButton from '../components/SocialButton';
import { IOrder, IOrderLabel, NestedObjectType } from '@marblez/graphql';
import { Slate, Editable, withReact, useSlate, ReactEditor } from 'slate-react'
import { Text, Node, createEditor, Range, Editor } from 'slate'
import { withHistory } from 'slate-history'
import { theme } from '../theme';
import DatePicker from './DatePicker';
import OrderLabelsModal from './OrderLabelsModal'
import { condition } from 'tripetto-runner-foundation';


async function printPDF (domElement?: any) { 
  domElement.ownerDocument.defaultView.innerHeight = 10000000;
  // domElement.ownerDocument.defaultView.innerWidth = domElement.clientWidth;
  window.scroll(0, 0)

  const html2canvas = (await import('html2canvas'));
  const jsPdf = (await import('jspdf'));
  
  return html2canvas(domElement, { 
    width: domElement.clientWidth, 
    height: domElement.clientHeight,
    useCORS: true,
  })
    .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        // downloadURI(imgData, 'wtf.png');
        const pdf = new jsPdf('p', 'px', [domElement.clientHeight, domElement.clientWidth]);
        const imgProps= (pdf as unknown as any).getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        console.log('=== size', pdfWidth, pdfHeight)
        pdf.save('your-filename.pdf')
  })
}
export interface OrderProps {
  order?: OrderInput;
  onUpdate?: () => any;
}

const UPDATE_ORDER = gql`
  mutation updateOrder($order: OrderInput!) {
    updateOrder(order: $order) {
      index
    }
  }
`;

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20, ...0[]]

type Join<K, P> = K extends string | number ?
    P extends string | number ?
    `${K}${"" extends P ? "" : "."}${P}`
    : never : never;

type Paths<T, D extends number = 10> = T extends Array<any> ? never : [D] extends [never] ? never : T extends object ?
    { [K in keyof T]-?: K extends string ?
        `${K}` | Join<K, Paths<T[K], Prev[D]>>
        : never
    }[keyof T] : ""

type Leaves<T, D extends number = 10> = [D] extends [never] ? never : T extends object ?
    { [K in keyof T]-?: Join<K, Leaves<T[K], Prev[D]>> }[keyof T] : "";

function get<T>(obj: T, path: Paths<T, 3>, defValue: any = undefined) {
  // If path is not defined or it has false value
  if (!path) return undefined
  // Check if path is string or array. Regex : ensure that we do not have '.' and brackets.
  // Regex explained: https://regexr.com/58j0k
  const pathArray = Array.isArray(path) ? path : (path as unknown as string).match(/([^[.\]])+/g)
  // Find value if exist return otherwise return undefined value;
  return (
    pathArray.reduce((prevObj: any, key: string) => prevObj && prevObj[key], obj) || defValue
  )
}
    

function lineIf<T extends IOrder>(o: any, fields: Paths<T,  3>[], opt: any = {}) {
  if (!o || !fields) {
    return null;
  }
  
  const line = (
    fields
    .map(function(f, i) {
      if (!f) {
        return null;
      }
      
      if (opt && opt.overrides && opt.overrides[i]) {
        return opt.overrides[i](get(o, f))
      }
      if (f === 'deliveryDate') {
        return  format(parseISO(o[f] as string), 'MM/dd');
      }

      if (['cake', 'shape', 'color', 'taste', 'letter'].includes(f)) {
        return get(o, f).replace(/\([^(\))]*\)/g, '')
      }

      return get(o, f)
    })
    .filter(Boolean)
    .join(' ')
  )
  return (
      line.trim().length > 0 ? ((opt && opt.prefix) || '') + line.trim() : ''
  );
}

const SocialButtonGroup = styled(Box)`
  > *:not(:last-child) {
    margin-right: ${theme.space[2]};
  }
`;

const StyledBox = styled(Box)`
  :active {
    box-shadow: ${theme.shadows.lg}
  }
`;

export const order2Lines = (order: any) => [
  lineIf(order, ['customerName', 'customerPhone'], {prefix: '👨 '}),
  lineIf(order, ['deliveryDate', 'deliveryTime'], {prefix: '🕐 '}),
  lineIf(order, ['otherAttributes.cake', 'otherAttributes.size'], {prefix: '🎂 '}),
  lineIf(order, ['otherAttributes.decorations', 'otherAttributes.toppings'], {prefix: '📿 '}),
  lineIf(order, ['otherAttributes.shape', 'otherAttributes.color'], {prefix: '‎‎‎⠀⠀ '}),
  lineIf(order, ['otherAttributes.taste', 'otherAttributes.letter'], {prefix: '‎‎⠀⠀ '}),
  lineIf(order, ['otherAttributes.innerTaste', 'otherAttributes.bottomTaste'], {prefix: '‎‎⠀⠀ '}),
  lineIf(order, ['otherAttributes.sentence'], {prefix: '✍️️ '}),
  lineIf(order, ['otherAttributes.paidSentence'], {prefix: '朱古力牌 ✍️️ '}),
  lineIf(order, ['customerSocialChannel', 'customerSocialName'], {prefix: '📲 '}),
  lineIf(order, ['deliveryMethod', 'deliveryAddress'], {prefix: '🚚 '}),
  lineIf(order, ['remarks']),
].filter(Boolean)

function downloadPDFFromGoogle(index: any) {
  const urlPopup = window.open('', '_blank', 'width=200,height=100')
  
  fetch(`https://script.google.com/macros/s/AKfycbwg0O8hDydyA_qU8W1M91Wa5J_YeclQY9ZNZfmmdIu2Mfj820I/exec?index=${index}`)
    .then(urlResponse => urlResponse.json().then(json => {
      if (urlPopup) {
        urlPopup.location.href = json.url;
      }
    }))
}

const Leaf = memo(({ otherAttributes, children, leaf }) => {
  return (
    <Box
      as="span"
      {...otherAttributes}
      fontWeight={leaf.bold && 'bold'}
      bgColor={leaf.highlight && leaf.highlightColor}
    >
      {children}
    </Box>
  )
})

const HoveringToolbar = ({
  order,
  orderLabels,
  onSaveOrderLabelsSuccess
}: {
  order: IOrder,
  orderLabels: IOrderLabel[],
  onSaveOrderLabelsSuccess: () => any;
}) => {
  const [saveOrderLabels] = useMutation(gql`
    mutation($orderLabelsInput: OrderLabelsInput!) {
      saveOrderLabels(orderLabelsInput: $orderLabelsInput) {
        name
        color
      }
    }
  `, {
    onCompleted: onSaveOrderLabelsSuccess
  });

  const [deleteOrderLabels] = useMutation(gql`
    mutation($orderLabelsInput: OrderLabelsInput!) {
      deleteOrderLabels(orderLabelsInput: $orderLabelsInput)
    }
  `, {
    onCompleted: onSaveOrderLabelsSuccess
  });
  
  const ref = useRef<any>()
  const editor = useSlate()

  const keyword = useMemo(() => 
    editor.selection ? Editor.string(editor, editor.selection) : '',
    [editor.selection]
  );
  const matchedOrderLabel = useMemo(() => 
    orderLabels.find(label => label.conditions.find(condition => condition.keyword === keyword)),
    [orderLabels, keyword]
  );

  useEffect(() => {
    const el = ref.current
    const { selection } = editor

    if (!el) {
      return
    }

    if (
      !selection ||
      !ReactEditor.isFocused(editor) ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ''
    ) {
      el.removeAttribute('style')
      return
    }

    const domSelection = window.getSelection()
    const domRange = domSelection.getRangeAt(0)
    const rect = domRange.getBoundingClientRect()
    el.style.opacity = '1'
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`
    el.style.left = `${rect.left +
      window.pageXOffset -
      el.offsetWidth / 2 +
      rect.width / 2}px`
  });

  const deleteSelectedOrderLabel = useCallback(
    async () => {
      await deleteOrderLabels({
        variables: {
          orderLabelsInput: {
            labels: omit('__typename')(matchedOrderLabel)
          }
        },
      })
    },
    [order, editor, deleteOrderLabels, matchedOrderLabel]
  )

  const addSelectedOrderLabel = useCallback(
    async () => {
      if (!editor.selection) {
        return;
      }
      await saveOrderLabels({
        variables: {
          orderLabelsInput: {
            // orderId: order.id,
            labels: [
              // ...map((order.meta || {}).labels || [], omit('__typename')),
              { name: keyword, conditions: [{ keyword  }] }
            ]
          }
        },
      })
    },
    [order, editor, saveOrderLabels]
  )

  return (
    <Portal>
      <Box
        ref={ref}
        css={css`
          padding: 8px 7px 6px;
          position: absolute;
          z-index: 1;
          top: -10000px;
          left: -10000px;
          margin-top: -6px;
          opacity: 0;
          background-color: #222;
          border-radius: 4px;
          transition: opacity 0.75s;
        `}
      >
        {matchedOrderLabel ? <Button onClick={deleteSelectedOrderLabel}>刪除標記</Button> : <Button onClick={addSelectedOrderLabel}>標記</Button>}
      </Box>
    </Portal>
  )
}


function Order({ order, onUpdate = () => {} }: OrderProps) {
  const lines = useMemo(() => order2Lines(order), [order]);

  const { data: { orderLabels = [] } = {}, refetch: refetchOrderLabels } = useQuery(gql`
    query {
      orderLabels {
        _id
        name
        color
        conditions
      }
    }
  `);
  const [value, setValue] = useState<Node[]>([{
    children: [
      {
        text: lines.join('\n'),
      },
    ],
  }])
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])
  const decorate = useCallback(
    ([node, path]) => {
      const ranges = []

      if (orderLabels.length && Text.isText(node)) {
        const conditionsWithLabel = [];
        for (const label of orderLabels || []) {
          conditionsWithLabel.push(...(label.conditions || []).map(condition => (
            {
              ...condition,
              label,
            }
          )))
        }
        
        const { text } = node
        const regex = new RegExp(conditionsWithLabel.map(condition => condition.keyword).filter(Boolean).join('|'), 'g')

        let match;

        while ((match = regex.exec(text)) !== null) {
          ranges.push({
            anchor: { path, offset: match.index },
            focus: { path, offset: match.index + match[0].length },
            highlight: true,
            highlightColor: conditionsWithLabel.find(conditionWithLabel => conditionWithLabel.keyword ===  match[0]).label.color,
          })
        }
      }

      return ranges
    },
    [order]
  )
  
  const [updateOrder] = useMutation(UPDATE_ORDER);
  const screenshotRef = useRef();
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const firstField = React.useRef<HTMLInputElement>();
  const downloadPDF = React.useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    printPDF(screenshotRef.current);
    // downloadPDFFromGoogle(order?.index);
  }, [screenshotRef.current]);

  return (
    <>
      <StyledBox 
        w="100%" 
        overflow="hidden"
        rounded="sm"
        p={5}
        sx={{
          boxShadow: 'rgb(0 0 0 / 8%) 0px 0 20px'
        }}
        minHeight={353} 
        fontSize={16} 
        position="relative" 
        onDoubleClick={onOpen}
      >
        {!order?.otherAttributes.printed && (
          <Badge ml="1" variantColor="blue">
            New
          </Badge>
        )}
        {!order?.paid && (
          <Badge ml="1" variantColor="orange">
            Unpaid
          </Badge>
        )}
        <Box>
        <Box ref={screenshotRef}>
          <Slate 
            editor={editor} 
            value={value} 
            onChange={value => setValue(value)}
          >
            <HoveringToolbar order={order} orderLabels={orderLabels} onSaveOrderLabelsSuccess={() => refetchOrderLabels().then(onUpdate)} />
            <Editable 
              decorate={decorate} 
              renderLeaf={props => <Leaf {...props} />} 
            />
          </Slate>
        </Box>
        </Box>
        <SocialButtonGroup pos="absolute" right="5" top="5">
          <SocialButton.WhatsApp icon={<ExternalLinkIcon />} text={lines.join('\n')} />
        </SocialButtonGroup>
        <SocialButtonGroup pos="absolute" right="5" bottom="5" bg="orange">
          <SocialButton.WhatsApp phone={order && order.phone} />
          {order?.order_from?.toLowerCase()?.includes('ig') && !order?.social_name?.trim()?.includes(' ') && <SocialButton.Instagram username={order?.social_name} />}
           <IconButton icon={<FaFileDownload />} aria-label="Download Order as PDF" onClick={downloadPDF} />
        </SocialButtonGroup>
      </StyledBox>
      {/* {order && (
        <OrderLabelsModal order={order} isOpen={isOpen} onClose={onClose} />
      )} */}
      {/* {order && (
        <Drawer onClose={onClose} isOpen={isOpen} size="md">
          <DrawerOverlay />
            <RemoveScroll>
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Edit {order.phone}</DrawerHeader>
            <DrawerBody style={{ maxHeight: 'calc(100vh - 62px)', overflow: 'scroll' }}>
                <Formik
                  initialValues={order}
                  onSubmit={(order, actions) => {
                    delete order.__typename;
                    updateOrder({ variables: { order } })
                      .then(onUpdate)
                      .then(onClose)
                      .then(() => actions.setSubmitting(false))
                  }}
                >
                  {props => (
                  <form onSubmit={props.handleSubmit}>
                    <Stack spacing="24px">
                    <Field name="paid">
                    {({field}: { field: any }) => (
                        <FormControl>
                          <Checkbox {...field} isChecked={field.value}>
                            {!field.value ? (
                                <Badge ml="1" variantColor="orange">
                                  Unpaid
                                </Badge>
                            ) : (
                              <Badge ml="1" variantColor="green">
                                Paid
                              </Badge>
                            )}
                          </Checkbox>
                        </FormControl>
                    )}
                    </Field>
                    <Field name="name">
                      {({field}: { field: any }) => (
                        <FormControl>
                          <FormLabel htmlFor="name">Name</FormLabel>
                          <Input {...field} ref={firstField} />
                        </FormControl>
                      )}
                    </Field>
                    <Field name="phone">
                      {({field}: { field: any }) => (
                        <FormControl>
                          <FormLabel htmlFor="phone">Phone</FormLabel>
                          <Input {...field} type="phone" />
                        </FormControl>
                      )}
                    </Field>
                    <Field name="date">
                      {({field}: { field: any }) => (
                        <FormControl>
                          <FormLabel htmlFor="date">Date</FormLabel>
                          <DatePicker {...field} withArrows={false} />
                        </FormControl>
                      )}
                    </Field>
                    <Field name="time">
                      {({field}: { field: any }) => (
                        <FormControl>
                          <FormLabel htmlFor="time">Time</FormLabel>
                          <Input {...field} />
                        </FormControl>
                      )}
                    </Field>
                    {['cake', 'size', 'shape', 'color', 'taste', 'letter', 'sentence', 'delivery_method', 'delivery_address'].map(attr => (
                      <Field name={attr}>
                        {({field}: { field: any }) => (
                          <FormControl>
                            <FormLabel htmlFor={attr}>{capitalize(attr.replace('_', ' '))}</FormLabel>
                            <Input {...field} />
                          </FormControl>
                        )}
                      </Field>
                    ))}

                    <FieldArray name="decorations">
                      {({remove, push}) => (
                        <div>
                          <FormLabel htmlFor="decorations">Decorations</FormLabel>
                          {props.values.decorations.map((decoration, index) => (
                            <FormControl mb={1}>
                              <Field name={`decorations.${index}`}>
                                {({field}: { field: any }) => (
                                  <Flex mt={1}>
                                    <Input mr={2} {...field} />
                                    <IconButton aria-label="Delete decoration" icon={<DeleteIcon />} onClick={() => remove(index)} />
                                  </Flex>
                                )}
                              </Field>
                            </FormControl>
                          ))}
                          <IconButton size="sm" aria-label="Add decoration" icon={<AddIcon />} w="100%" onClick={() => push('')} />
                        </div>
                      )}
                    </FieldArray>
                    <Field name="remarks">
                      {({field}: { field: any }) => (
                        <FormControl>
                          <FormLabel htmlFor="remarks">Remarks</FormLabel>
                          <Textarea {...field} size="lg" />
                        </FormControl>
                      )}
                    </Field>
                    <Button
                      mt={4}
                      variantColor="teal"
                      isLoading={props.isSubmitting}
                      type="submit"
                      loadingText="Updating..."
                    >
                      Update
                    </Button>
                    </Stack>
                  </form>
                  )}
                </Formik>
            </DrawerBody>
          </DrawerContent>
            </RemoveScroll>
        </Drawer>
      )} */}
    </>
  )
}

export default  Order;
