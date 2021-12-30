import * as React from "react";
import { Component } from "./Component";

interface Props {
  children: string;
}

export class Title extends Component<Props, {}, React.HTMLAttributes<HTMLTitleElement>> {
  public render(): JSX.Element {
    const { children } = this.props;
    document.title = children;
    return <></>;
  }
}
