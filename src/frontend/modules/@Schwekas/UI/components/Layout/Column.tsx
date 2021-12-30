import { Component } from "@core/components/Component";
import classNames from "classnames";
import * as React from "react";
import css from "./Layout.scss";

interface Props {
  width: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12";
  noOuterPadding?: boolean;
}

export class Column extends Component<Props> {
  public render(): JSX.Element {
    const {
      width,
      children,
      className,
      noOuterPadding: _noOuterPadding,
      ...props
    } = this.props;
    const noOuterPadding = _noOuterPadding ?? false;

    return (
      <div
        className={classNames(
          className,
          css.column,
          css[`column-${width}`],
          { [css.noPaddingOuter]: noOuterPadding }
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
}
