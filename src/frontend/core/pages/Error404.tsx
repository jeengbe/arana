import { Title } from "@core/components/Title";
import { __, ___ } from "@core/i18n";
import { Page } from "@core/Page";
import { Route } from "@core/routeDecorator";
import { Column } from "@modules/@Schwekas/UI/components/Layout/Column";
import { Row } from "@modules/@Schwekas/UI/components/Layout/Row";
import { Heading } from "@modules/@Schwekas/UI/components/Typography/Heading";
import * as React from "react";

@Route(___("pages.error.404.route"))
export class Error404 extends Page {
  public render(): JSX.Element {
    return (
      <>
        <Title>{__("pages.error.404.title")}</Title>
        <Row>
          <Column width="12">
            <Heading size="1">{__("pages.error.404.text")}</Heading>
          </Column>
        </Row>
      </>
    );
  }
}
