import { Duration, Stack } from 'aws-cdk-lib';
import { HttpApi, HttpMethod, CorsHttpMethod, CfnStage } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpUserPoolAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import type { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import type { IUserPool, IUserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { fileURLToPath } from 'node:url';

export function addProfileApi(stack: Stack, table: ITable, userPool: IUserPool, userPoolClient: IUserPoolClient) {
  const handler = new NodejsFunction(stack, 'ProfileHandler', {
    entry: fileURLToPath(new URL('./handler.js', import.meta.url)), handler: 'handler',
    runtime: Runtime.NODEJS_22_X, timeout: Duration.seconds(15), memorySize: 256,
    bundling: { externalModules: [] }, environment: { PROFILE_TABLE: table.tableName },
  });
  table.grant(handler, 'dynamodb:GetItem', 'dynamodb:UpdateItem');
  const origins = [...new Set((process.env.AUTH_REDIRECT_URLS || 'http://localhost:8000/,http://localhost:3000/')
    .split(',').map(url => new URL(url.trim()).origin))];
  const api = new HttpApi(stack, 'ProfileApi', { corsPreflight: {
    allowOrigins: origins, allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.PUT], allowHeaders: ['Content-Type', 'Authorization'], maxAge: Duration.hours(1),
  } });
  const stage = api.defaultStage?.node.defaultChild as CfnStage;
  stage.defaultRouteSettings = { throttlingBurstLimit: 20, throttlingRateLimit: 10 };
  api.addRoutes({ path: '/profile', methods: [HttpMethod.GET, HttpMethod.PUT],
    integration: new HttpLambdaIntegration('ProfileIntegration', handler),
    authorizer: new HttpUserPoolAuthorizer('ProfileAuth', userPool, { userPoolClients: [userPoolClient] }),
  });
  return { endpoint: api.apiEndpoint };
}
