import { Component } from "@core/components/Component";
import classNames from "classnames";
import * as React from "react";
import { settings } from "../../../pages/Projects";
import css from "./Layout.scss";

interface Props {
  variant: typeof settings.projects.overview.displayMode;
}

export class ProjectsOverview extends Component<Props> {
  public render(): JSX.Element {
    const { variant, data } = this.props;

    return (
      <div className={classNames(className, css.container)} {...props}>
        {children}
      </div>
    );
  }
}
