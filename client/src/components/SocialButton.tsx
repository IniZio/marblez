import { IconButton, Tooltip, useClipboard } from '@chakra-ui/react';
import React, { ReactElement, useMemo } from 'react';
import { FaClipboard } from '@react-icons/all-files/fa/FaClipboard';
import { FaInstagram } from '@react-icons/all-files/fa/FaInstagram';
import { FaWhatsapp } from '@react-icons/all-files/fa/FaWhatsapp';
import { isMobile } from '../util/device';


export interface SocialButtonProps {
  text?: string;
  icon?: ReactElement;
  phone?: string;
  username?: string;
}

const SocialButton = {};

function SocialButtonInstagram ({ username, icon }: SocialButtonProps) {
  const encodedUsername = encodeURIComponent(username || '').toLowerCase();

  const href = useMemo(() => {
    let href;
    href = `https://www.instagram.com/${encodedUsername}`;
    return href;
  }, [username])

  return (
    <a href={href} target="_blank">
      <IconButton icon={icon || <FaInstagram />} aria-label="View Instagram profile" />
    </a>
  )
}

function SocialButtonWhatsApp ({ text = '', icon, phone = '' }: SocialButtonProps) {
  const encodedText = encodeURIComponent(text);
  const encodedPhone = encodeURIComponent(phone);

  const href = useMemo(() => {
    let href;
    if (isMobile.any) {
      href = `whatsapp://send?text=${encodedText}`
    } else {
      href = `https://web.whatsapp.com/send?text=${encodedText}`;
    }

    if (encodedPhone) {
      href += `&phone=${encodedPhone}`;
    }

      return href;
  }, [text])

  return (
    <a href={href} target="_blank">
      <IconButton icon={icon || <FaWhatsapp />} aria-label="Share on WhatsApp" />
    </a>
  )
}

function SocialButtonClipBoard({ text = '' }: SocialButtonProps) {
  const { onCopy, hasCopied } = useClipboard(text);

  return (
    <Tooltip aria-label="Copied Order" label="Order Copied!" isOpen={hasCopied} placement="top">
     <IconButton icon={<FaClipboard />} onClick={onCopy} aria-label="Copy Order" />
    </Tooltip>
  )
}

export default Object.assign(SocialButton, {
  WhatsApp: SocialButtonWhatsApp,
  ClipBoard: SocialButtonClipBoard,
  Instagram: SocialButtonInstagram,
});
