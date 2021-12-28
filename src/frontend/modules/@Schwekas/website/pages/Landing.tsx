import Page from "@core/Page";
import * as React from "react";
import Title from "@core/components/Title";
import { __ } from "../i18n";
import Heading from "@Schwekas/UI/components/Typography/Heading";
import Route from "@core/routeDecorator";

@Route("/")
export default class Landing extends Page {
  public render(): JSX.Element {
    return (
      <>
        <Title>{__("pages.landing.title")}</Title>
        <Heading size="3">
          {__("pages.landing.welcome")}
        </Heading>
      </>
    );
  }
}
