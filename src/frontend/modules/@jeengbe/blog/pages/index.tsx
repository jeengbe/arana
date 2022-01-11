import { Title } from "@core/components/Title";
import { Page } from "@core/Page";
import { Route } from "@core/routeDecorator";
import * as React from "react";
import { BlogList } from "../components/blog/BlogList";
import { __ } from "../i18n";

@Route("/")
export class Index extends Page {
  public render(): JSX.Element {
    return (
      <>
        <Title>{__("pages.landing.title")}</Title>
        <h3>
          {__("pages.landing.welcome")}
        </h3>
        <BlogList />
      </>
    );
  }
}
