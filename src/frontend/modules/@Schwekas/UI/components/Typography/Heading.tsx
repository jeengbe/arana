import Component from "@core/components/Component";
import * as React from "react";
import "./Typography.scss";

interface Props {
  size: "1" | "2" | "3" | "4" | "5" | "6";
}

export default class Heading extends Component<
  Props,
  {},
  React.AllHTMLAttributes<HTMLHeadingElement>
> {
  public displayName = `Heading ${this.props.size}`;

  public render(): JSX.Element {
    const { size, children, ...props } = this.props;

    return React.createElement(`h${size}`, props, children);
  }
}
