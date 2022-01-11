import * as React from "react";
import { HTMLComponent } from "./Component";

interface Props {
  children: string;
}

export class Title extends HTMLComponent<Props, {}, React.HTMLAttributes<HTMLTitleElement>> {
  public render(): JSX.Element {
    const { children } = this.props;
    document.title = children;
    return <></>;
  }
}
