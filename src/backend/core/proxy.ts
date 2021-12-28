/* eslint-disable camelcase */
import * as Schwekas_pool_module from "@modules/@Schwekas/pool/api/module";
import * as Schwekas_poolextension_module from "@modules/@Schwekas/poolextension/api/module";

export class ModuleProxy {
  // Store false modules
  private readonly instances = { } as Record<string, any>;

  constructor(data: any) {
    this.instances.Schwekas_pool_module_Module = new Schwekas_pool_module.Module(data);
    this.instances.Schwekas_poolextension_module_Module = new Schwekas_poolextension_module.Module(data);
  }

  // Begin false properties
  public get vendor(): any {
    return this.instances.Schwekas_pool_module_Module.vendor;
  }

  public get name(): any {
    return this.instances.Schwekas_pool_module_Module.name;
  }

  public get version(): any {
    return this.instances.Schwekas_pool_module_Module.version;
  }

  public get description(): any {
    return this.instances.Schwekas_pool_module_Module.description;
  }

  public get path(): any {
    return this.instances.Schwekas_pool_module_Module.path;
  }

  public get dependencies(): any {
    return this.instances.Schwekas_pool_module_Module.dependencies.bind(this.instances.Schwekas_pool_module_Module);
  }

  public get history(): Record<string, string> {
    return this.instances.Schwekas_poolextension_module_Module.history.bind(this.instances.Schwekas_poolextension_module_Module);
  }
}
