import Component from "@core/components/Component";
import classNames from "classnames";
import * as React from "react";
import css from "./Layout.scss";

export default class Container extends Component {
  public displayName = "Container";

  public render(): JSX.Element {
    const { className, children, ...props } = this.props;

    return (
      <div className={classNames(className, css.container)} {...props}>
        {children}
      </div>
    );
  }
}
