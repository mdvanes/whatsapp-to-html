//tslint:disable:no-expression-statement

import { whatsappToHtml } from "./index";
import minimist from "minimist";
import * as fs from "fs";

type Args = {
  readonly [key: string]: string;
};
type ValidationErrors = ReadonlyArray<string>;

const argValidations: {
  readonly [key: string]: [string, (x: any) => boolean];
} = {
  datePattern: [
    "Please provide a date pattern via the -d flag",
    (s: string) => s.length > 0,
  ],
  filePath: ["Please specify a valid file", fs.existsSync],
  senderAliasesPath: [
    "Please specify a valid file",
    // since this arg is optional, don't complain if no file is specified
    // do complain if it's specified, but does not exist
    (path: string) => (path === null ? true : fs.existsSync(path)),
  ],
};

// tslint:disable-next-line:readonly-array
function processArgs(argv: Array<string>): minimist.ParsedArgs {
  const parsedArgs = minimist(argv, {
    default: {
      t: "",
      d: "",
      l: "",
      'hide-meta': false,
      a: null,
    },
  });

  return parsedArgs;
}

function validateArgs(
  args: Args,
  validations: typeof argValidations
): ValidationErrors | [] {
  return Object.entries(validations).reduce(
    (errors: ValidationErrors, [key, [error, pred]]) => {
      const value = args[key];
      const errorMessage = pred(value) ? null : error;

      return errorMessage ? errors.concat(errorMessage) : errors;
    },
    []
  );
}

function main(): void {
  const {
    t: title,
    d: datePattern,
    l: locale,
    'hide-meta': hideMeta,
    a: senderAliasesPath,
    _: [filePath],
  } = processArgs(process.argv.slice(2));

  const errors = validateArgs(
    {
      title,
      datePattern,
      locale,
      hideMeta,
      senderAliasesPath,
      filePath,
    },
    argValidations
  );

  if (errors.length > 0) {
    console.log("Failure: ");
    errors.forEach(error => {
      console.log(error);
    });

    return;
  }

  const result = whatsappToHtml(
    filePath,
    title,
    datePattern,
    locale,
    hideMeta,
    senderAliasesPath &&
      JSON.parse(fs.readFileSync(senderAliasesPath).toString())
  );

  console.log(result);
}

main();
