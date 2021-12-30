import { Component } from "@core/components/Component";
import classNames from "classnames";
import * as React from "react";
import css from "./Layout.scss";

export class Row extends Component {
  public render(): JSX.Element {
    const { className, children, ...props } = this.props;

    return (
      <div className={classNames(className, css.row)} {...props}>
        {children}
      </div>
    );
  }
}
