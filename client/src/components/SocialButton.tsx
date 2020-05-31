import React, { useMemo, useCallback } from 'react';
import { Box, useClipboard, Button, useToast, Tooltip, IconButton } from '@chakra-ui/core';
import { FaWhatsapp, FaClipboard } from 'react-icons/fa';

import { isMobile } from '../util/device';

export interface SocialButtonProps {
  text?: string;
}

const SocialButton = {};

function SocialButtonWhatsApp ({ text = '' }: SocialButtonProps) {
  const encodedText = encodeURIComponent(text);

  const href = useMemo(() => {
      if (isMobile.any) {
        return `whatsapp://send?text=${encodedText}`
      }

      return `https://web.whatsapp.com/send?text=${encodedText}`;
  }, [text])

  return (
    <a href={href} target="_blank">
      <IconButton icon={FaWhatsapp} aria-label="Share on WhatsApp" />
    </a>
  )
}

function SocialButtonClipBoard({ text = '' }: SocialButtonProps) {
  const { onCopy, hasCopied } = useClipboard(text);
  
  const onClick = useCallback(() => {
    onCopy && onCopy();
  }, [text]);

  return (
    <Tooltip aria-label="Copied Order" label="Order Copied!" isOpen={hasCopied} placement="top">
    <IconButton icon={FaClipboard} onClick={onCopy} aria-label="Copy Order" />
    </Tooltip>
  )
}

export default Object.assign(SocialButton, {
  WhatsApp: SocialButtonWhatsApp,
  ClipBoard: SocialButtonClipBoard,
});
