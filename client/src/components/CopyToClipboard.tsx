import React from 'react';
import copy from 'copy-to-clipboard';

export interface CopyToClipboardProps {
  text: string;
  children: React.ReactNode,
  onCopy: (...args: any[]) => any,
  options?: {
    debug: boolean;
    message: string;
    format: string;
  }
}

class CopyToClipboard extends React.PureComponent<CopyToClipboardProps> {
  static defaultProps = {
    onCopy: undefined,
    options: undefined
  };


  onClick = event => {
    const {
      text,
      onCopy,
      children,
      options
    } = this.props;

    const elem = React.Children.only(children);

    const result = copy(text, options);

    if (onCopy) {
      onCopy(text, result);
    }

    // Bypass onClick if it was present
    if (typeof (elem as any)?.props?.onClick === 'function') {
      (elem as any).props.onClick(event);
    }
  };


  render() {
    const {
      text: _text,
      onCopy: _onCopy,
      options: _options,
      children,
      ...props
    } = this.props;
    const elem = React.Children.only(children);

    return React.cloneElement(elem as any, {...props, onClick: this.onClick});
  }
}

export default CopyToClipboard;
