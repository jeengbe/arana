import { Component, UserComponent, VariantComponent } from "@core/components/Component";
import classNames from "classnames";
import * as React from "react";
import { __ } from "../../i18n";

// TODO: Remove
declare class Icon extends Component<{ type: string; }> {
  public render(): JSX.Element;
}

interface Props {
  dismissible?: boolean;
  icon?: JSX.Element;
  children: string | string[];
}

@UserComponent<Props>({
  name: __("components.alert.name"),
  description: __("components.alert.description"),
  examples: [
    ...VariantComponent.variants.map(variant => (
      <Alert key={`v-${variant}`} variant={variant}>
        {__("components.alert.examples.variants.content", {
          variant
        })}
      </Alert>
    )),
    <Alert key="dismissible" dismissible>
      {__("components.alert.examples.dismissible.content")}
    </Alert>,
    <Alert key="icon" icon={<Icon type="happy-face" />}>
      {__("components.alert.examples.icon.content")}
    </Alert>
  ],
  props: {
    dismissible: {
      name: __("components.alert.props.dismissible.name"),
      description: __("components.alert.props.dismissible.description"),
      type: "boolean"
    },
    icon: {
      name: __("components.alert.props.icon.name"),
      description: __("components.alert.props.icon.description"),
      type: Icon
    },
    children: {
      name: __("components.alert.props.children.name"),
      description: __("components.alert.props.children.description"),
      type: "string"
    }
  }
})
export class Alert extends VariantComponent<Props> {
  public render(): JSX.Element {
    const { children, className, ...props } = this.props;

    return (
      <div
        className={classNames(className)}
        {...props}
        // @TODO: Render Icon
      >
        {children}
      </div>
    );
  }
}
