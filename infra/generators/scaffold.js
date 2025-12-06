import Generator from "yeoman-generator";

import getModuleNames from "./helpers/get-module-names.js";
import pluralToSingularGlobal from "./helpers/plural-to-singular.js";

export default class extends Generator {
  isSecure = false;
  /**
   * @param {any[]} args
   * @param {{ modelName?: string; modelAttributes?: string }} opts
   */
  constructor(args, opts) {
    super(args, opts);
    this.argument("modelName", { required: true, type: String });
    this.argument("modelAttributes", { required: true, type: String });
  }

  _parseModelAttributes(modelAttributes) {
    const fields = [];

    for (const part of modelAttributes.split(",").map((part) => part.trim())) {
      const [nameType, typeWithOptions] = part.split(":", 2);
      const nullable = nameType.endsWith("?");
      const name = nullable ? nameType.slice(0, -1) : nameType;
      const options = {};
      let type = typeWithOptions;

      // Handling length within type options
      const lengthMatch = typeWithOptions.match(/\((\d+)\)/);
      if (lengthMatch) {
        options.length = Number.parseInt(lengthMatch[1], 10);
        type = typeWithOptions.split("(")[0];
      }

      fields.push({
        name,
        nullable,
        options,
        type,
      });
    }

    return fields;
  }

  /**
   * @returns {Promise<void>} - Promise that resolves when the prompt is completed.
   */
  prompting() {
    return this.prompt([
      {
        default: true,
        message: "Need request authorization?",
        name: "isSecure",
        type: "confirm",
      },
    ]).then((dto) => {
      const { isSecure } = dto;
      this.isSecure = isSecure;
    });
  }

  writing() {
    // @ts-ignore - yeoman-generator options are dynamic
    const { modelAttributes, modelName } = this.options;
    const fields = this._parseModelAttributes(modelAttributes);
    const { isSecure } = this;

    const moduleNames = getModuleNames(modelName);
    const pluralModuleNames = getModuleNames(pluralToSingularGlobal(modelName));
    const templateData = {
      fields,
      isSecure,
      modelName,
      moduleNames,
      pluralModuleNames,
    };

    // Helper function to simplify template copying
    const copyTemplate = (templateName, destinationName) => {
      this.fs.copyTpl(
        this.templatePath(`${templateName}.ejs`),
        this.destinationPath(`src/modules/${modelName}/${destinationName}.js`),
        templateData,
      );
    };

    // Using the helper function to copy each template
    copyTemplate("model", `${modelName}.model`);
    copyTemplate("router", `${modelName}.router.v1`);
    copyTemplate("schemas", `${modelName}.schemas`);
    copyTemplate("contracts", `${modelName}.contracts`);
    copyTemplate("service", `${modelName}.service`);
  }
}
