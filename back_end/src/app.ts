import path from "path";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require("express");
import { NextFunction, Request, RequestHandler, Response } from "express";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const helmet = require("helmet");
import getConfig from "./config/config";
import ConfigTemplate from "./config/configTemplate";

const config: ConfigTemplate = getConfig();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const OpenApiValidator = require("express-openapi-validator");
import { RouteMetadata } from "express-openapi-validator/dist/framework/openapi.spec.loader";
import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

const app = express();

const port = config.port;

app.use(helmet());

app.use(
  OpenApiValidator.middleware({
    apiSpec: path.join(
      __dirname,
      "../../..",
      "api_documentation/reference",
      "api.yaml"
    ),
    validateResponses: true,
    operationHandlers: {
      basePath: __dirname,
      resolver: (
        handlersPath: string,
        route: RouteMetadata,
        apiDoc: OpenAPIV3.Document
      ): RequestHandler => {
        const pathKey = route.openApiRoute.substring(route.basePath.length);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const schema = (apiDoc.paths as any)[pathKey][
          route.method.toLowerCase()
        ];
        const [method, controller] = schema["operationId"].split("-");

        const modulePath = path.join(handlersPath, controller, "route");

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const handler = require(modulePath);

        if (handler[method] === undefined) {
          throw new Error(
            `Could not find a [${method}] function in ${modulePath} when trying to route [${route.method} ${route.expressRoute}].`
          );
        }

        return handler[method];
      }
    }
  })
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

export { app, port };