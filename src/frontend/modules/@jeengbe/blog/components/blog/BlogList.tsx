import { Component } from "@core/components/Component";
import * as React from "react";

interface Props {}
interface State {
  entries: BlogEntry[];
}

interface BlogEntry {
  title: string;
  content: string;
}

export class BlogList extends Component<Props, State> {
  public componentDidMount(): void {
    // this.setState({
    //   entries: [
    //     {
    //       title: "First blog entry",
    //       content: "This is the first blog entry"
    //     },
    //     {
    //       title: "Second blog entry",
    //       content: "This is the second blog entry"
    //     }
    //   ]
    // });
  }

  public render(): JSX.Element {
    const { entries = [] } = this.state;

    return (
      <ul>
        {entries.map(({ title, content }) => (
          <li key={title}>
            <h3>{title}</h3>
            <p>{content}</p>
          </li>
        ))}
      </ul>
    );
  }
}
