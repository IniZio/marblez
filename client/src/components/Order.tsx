import { AddIcon, DeleteIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { Badge, Box, Button, Checkbox, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, Flex, FormControl, FormLabel, IconButton, Input, Stack, Textarea, useDisclosure } from '@chakra-ui/react';
import styled from '@emotion/styled';
import { gql } from 'apollo-boost';
import { format, parseISO } from 'date-fns';
import { Field, FieldArray, Formik } from 'formik';
import html2canvas from 'html2canvas';
import jsPdf from 'jspdf';
import { capitalize } from 'lodash';
import React, { useMemo, useRef } from 'react';
import { useMutation } from 'react-apollo';
import { FaFileDownload } from 'react-icons/fa';
import { RemoveScroll } from 'react-remove-scroll';
import SocialButton from '../components/SocialButton';
import { Order } from '../models/Order';
import { theme } from '../theme';
import DatePicker from './DatePicker';


function printPDF (domElement?: any) { 
  domElement.ownerDocument.defaultView.innerHeight = 10000000;
  // domElement.ownerDocument.defaultView.innerWidth = domElement.clientWidth;
  window.scroll(0, 0)
  
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
  order?: any;
  onUpdate?: () => any;
}

const UPDATE_ORDER = gql`
  mutation updateOrder($order: OrderInput!) {
    updateOrder(order: $order) {
      index
    }
  }
`;

function lineIf(o?: any, fields?: (keyof Order)[], opt?: any) {
  if (!o || !fields) {
    return null;
  }
  
  const line = (
    fields
    .map(function(f, i) {
      if (opt && opt.overrides && opt.overrides[i]) {
        return opt.overrides[i](o[f])
      }
      if (f === 'date') {
        return  format(parseISO(o[f] as string), 'MM/dd');
      }

      if (['cake', 'shape', 'color', 'taste', 'letter'].includes(f)) {
        return o[f].replace(/\([^(\))]*\)/g, '')
      }

      if (f === 'decorations' || f === 'toppings') {
        return o[f].map((v: string) => v.replace(/\([^(\))]*\)/g, ''))
      }
      return o[f]
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
  lineIf(order, ['name', 'phone'], {prefix: '👨 '}),
  lineIf(order, ['date', 'time'], {prefix: '🕐 '}),
  lineIf(order, ['cake', 'size'], {prefix: '🎂 '}),
  lineIf(order, ['decorations', 'toppings'], {prefix: '📿 '}),
  lineIf(order, ['shape', 'color'], {prefix: '‎‎‎⠀⠀ '}),
  lineIf(order, ['taste', 'letter'], {prefix: '‎‎⠀⠀ '}),
  lineIf(order, ['inner_taste', 'bottom_taste'], {prefix: '‎‎⠀⠀ '}),
  lineIf(order, ['sentence'], {prefix: '✍️️ '}),
  lineIf(order, ['paid_sentence'], {prefix: '朱古力牌 ✍️️ '}),
  lineIf(order, ['order_from', 'social_name'], {prefix: '📲 '}),
  lineIf(order, ['delivery_method', 'delivery_address'], {prefix: '🚚 '}),
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

function Order({ order, onUpdate = () => {} }: OrderProps) {
  const [updateOrder] = useMutation(UPDATE_ORDER);
  const screenshotRef = useRef();
  
  const lines = useMemo(() => order2Lines(order), [order]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const firstField = React.useRef<HTMLInputElement>();
  const downloadPDF = React.useCallback(async (e) => {
    e.stopPropagation();
    e.preventDefault();
    printPDF(screenshotRef.current);
    // downloadPDFFromGoogle(order?.index);
  }, [screenshotRef.current]);

  return (
    <>
      <StyledBox w="100%" borderWidth="1px" rounded="lg" overflow="hidden" p={5} shadow="md" minHeight={353} fontSize={20} position="relative" onClick={onOpen}>
        {!order?.printed && (
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
          {lines.map( 
            line => line && <Box key={line} mb={2}>{line}</Box>
          )}
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
      {order && (
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
      )}
    </>
  )
}

export default Order;
