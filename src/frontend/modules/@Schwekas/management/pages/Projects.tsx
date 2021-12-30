import { Page } from "@core/Page";
import * as React from "react";
import { Route } from "@core/routeDecorator";

// TODO: Settings as a whole
export declare const settings: {
  projects: {
    overview: {
      displayMode: "TABLE" | "CARDS";
    };
  };
};

@Route("/Projekte")
export class Projects extends Page {
  public render(): JSX.Element {
    const {
      projects: {
        overview: { displayMode },
      },
    } = settings;

    return (
      <Shell>
        <Title>Projekte</Title>
        <Heading size="3">Projektübersicht</Heading>
        <Loader
          // TODO: Problem for another day
          request={gql`
            query {
              projects(${filter}) {
                id,
                name,
                description,
                coverImage,
                status
              }
            }
        `}
        >
          {data => <ProjectsOverview variant={displayMode} data={data} />}
        </Loader>
      </Shell>
    );
  }
}
