import { Page } from "@core/Page";
import * as React from "react";
import { Route } from "@core/routeDecorator";
import { ProjectsOverview } from "../components/projects/overview/ProjectsOverview";

export enum ProjectsOverviewDisplayMode {
  "TABLE",
  "CARDS",
}

// TODO: Settings as a whole
export declare const settings: {
  projects: {
    overview: {
      displayMode: ProjectsOverviewDisplayMode;
    };
  };
};

// TODO: Load data
const data = [
  {
    name: "KTool",
    domain: "ktool.schwekas.de",
    description: "Managementsoftware für Autohäuser",
    status: "good",
  },
  {
    name: "Novia",
    domain: "novia.schwekas.de",
    description: "Verwaltung für SKJ",
    status: "good",
  },
];

@Route("/Projekte")
export class Projects extends Page {
  public render(): JSX.Element {
    const {
      projects: {
        overview: { displayMode },
      },
    } = settings;

    return (
      <>
        <Title>Projekte</Title>
        <Shell>
          <Heading size="3">Projektübersicht</Heading>
          <ProjectsOverview displayMode={displayMode} data={data} />
        </Shell>
      </>
    );
  }
}
