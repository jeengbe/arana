import { Component } from "@core/components/Component";
import classNames from "classnames";
import * as React from "react";

export class Row extends Component {
  public render(): JSX.Element {
    const { className, children, ...props } = this.props;

    return (
      <div className={classNames(className)} {...props}>
        {children}
      </div>
    );
  }
}
