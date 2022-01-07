import { Component } from "@core/components/Component";
import classNames from "classnames";
import * as React from "react";

export class Container extends Component {
  public displayName = "Container";

  public render(): JSX.Element {
    const { className, children, ...props } = this.props;

    return (
      <div className={classNames(className)} {...props}>
        {children}
      </div>
    );
  }
}
