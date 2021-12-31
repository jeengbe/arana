import { Component } from "@core/components/Component";
import classNames from "classnames";
import * as React from "react";
import { ProjectsOverviewDisplayMode } from "../../../pages/Projects";
import { settings } from "../../../pages/Projects";
import css from "./Layout.scss";

interface Props {
  variant: ProjectsOverviewDisplayMode;
  // TODO: Structure data
  data: any;
}

export class ProjectsOverview extends Component<Props> {
  public render(): JSX.Element {
    const { variant, data } = this.props;

    switch (variant) {
      case ProjectsOverviewDisplayMode.TABLE:
        return (
          <Table
            striped
            columns={[
              {
                title: "Name",
                field: ({ name, domain }) => (
                  <>
                    <b>{name}</b>
                    <br />
                    {domain}
                  </>
                ),
              },
              {
                title: "Beschreibung",
                field: "description",
              },
              {
                title: "Status",
                field: ({ status }) =>
                  ({
                    good: <Badge>Gut</Badge>,
                    warning: <Badge>Warnung</Badge>,
                  }[status]),
              },
            ]}
            request={filter => gql`
              query() {
                projects(${filter}) {
                  id
                  name
                  description
                  status
                }
              }
            `}
            // Replace with loading someday
            data={data}
          />
        );
      case ProjectsOverviewDisplayMode.CARDS:
        return data.map(project => <Card />);
    }
  }
}
