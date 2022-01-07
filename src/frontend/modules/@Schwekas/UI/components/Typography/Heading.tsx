import { Component } from "@core/components/Component";
import * as React from "react";

interface Props {
  size: "1" | "2" | "3" | "4" | "5" | "6";
}

export class Heading extends Component<
  Props,
  {},
  React.AllHTMLAttributes<HTMLHeadingElement>
> {
  public displayName = `Heading ${this.props.size}`;

  public render(): JSX.Element {
    const { size, children, ...props } = this.props;

    const className = {
      1: "text-5xl font-medium leading-tight mt-0 mb-2 text-blue-600",
      2: "text-4xl font-medium leading-tight mt-0 mb-2 text-blue-600",
      3: "text-3xl font-medium leading-tight mt-0 mb-2 text-blue-600",
      4: "text-2xl font-medium leading-tight mt-0 mb-2 text-blue-600",
      5: "text-xl font-medium leading-tight mt-0 mb-2 text-blue-600",
      6: "text-base font-medium leading-tight mt-0 mb-2 text-blue-600"
    }[size];

    return React.createElement(`h${size}`, { className, ...props }, children);
  }
}
