import { Title } from "@core/components/Title";
import { __, ___ } from "@core/i18n";
import { Page } from "@core/Page";
import { Route } from "@core/routeDecorator";
import * as React from "react";

@Route(___("pages.error.404.route"))
export class Error404 extends Page {
  public render(): JSX.Element {
    return (
      <>
        <Title>{__("pages.error.404.title")}</Title>
        <h1>{__("pages.error.404.text")}</h1>
      </>
    );
  }
}
