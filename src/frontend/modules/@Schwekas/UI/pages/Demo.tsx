import { createPluginCollector } from "@core/collector";
import { Title } from "@core/components/Title";
import { Page } from "@core/Page";
import { Route } from "@core/routeDecorator";
import * as React from "react";
import { Column } from "../components/Layout/Column";
import { Row } from "../components/Layout/Row";
import { Heading } from "../components/Typography/Heading";
import { __, ___ } from "../i18n";

// TODO: Post npm install: Remove native `Plugin` from TS Lib

export const widget = createPluginCollector();

// TEST: Add route collision check in tests
@Route(___("pages.demo.route"))
export class Demo extends Page {
  public render(): JSX.Element {
    return (
      <>
        <Title>{__("pages.demo.title")}</Title>
        <Row>
          <Column width="12">
            <Heading size="1">{__("pages.demo.welcome")}</Heading>
          </Column>
          {widget.render()}
        </Row>
      </>
    );
  }
}
