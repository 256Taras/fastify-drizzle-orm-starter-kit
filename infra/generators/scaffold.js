import Generator from "yeoman-generator"; // eslint-disable-line

import getModuleNames from "./helpers/get-module-names.js";
import pluralToSingularGlobal from "./helpers/plural-to-singular.js";

export default class extends Generator {
  isSecure = false;
  constructor(args, opts) {
    super(args, opts);
    this.argument("modelName", { type: String, required: true });
    this.argument("modelAttributes", { type: String, required: true });
  }

  /**
   * @returns {Promise<void>} - Promise that resolves when the prompt is completed.
   */
  prompting() {
    return this.prompt([
      {
        type: "confirm",
        name: "isSecure",
        message: "Need request authorization?",
        default: true,
      },
    ]).then((dto) => {
      const { isSecure } = dto;
      this.isSecure = isSecure;
    });
  }

  writing() {
    const { modelName, modelAttributes } = this.options;
    const fields = this._parseModelAttributes(modelAttributes);
    const { isSecure } = this;

    const moduleNames = getModuleNames(modelName);
    const pluralModuleNames = getModuleNames(pluralToSingularGlobal(modelName));
    const templateData = {
      modelName,
      fields,
      moduleNames,
      pluralModuleNames,
      isSecure,
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

  _parseModelAttributes(modelAttributes) {
    const fields = [];

    modelAttributes
      .split(",")
      .map((part) => part.trim())
      .forEach((part) => {
        const [nameType, typeWithOptions] = part.split(":", 2);
        const nullable = nameType.endsWith("?");
        const name = nullable ? nameType.slice(0, -1) : nameType;
        const options = {};
        let type = typeWithOptions;

        // Handling length within type options
        const lengthMatch = typeWithOptions.match(/\((\d+)\)/);
        if (lengthMatch) {
          options.length = parseInt(lengthMatch[1], 10);
          type = typeWithOptions.split("(")[0];
        }

        fields.push({
          name,
          type,
          options,
          nullable,
        });
      });

    return fields;
  }
}
