import { Duration, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { HttpApi, HttpMethod, CorsHttpMethod, CfnStage } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpUserPoolAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Table, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import type { IUserPool, IUserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { fileURLToPath } from 'node:url';

export function addPaymentReferences(stack: Stack, userPool: IUserPool, userPoolClient: IUserPoolClient) {
  const table = new Table(stack, 'PaymentReferences', {
    partitionKey: { name: 'id', type: AttributeType.STRING }, billingMode: BillingMode.PAY_PER_REQUEST,
    timeToLiveAttribute: 'expiresAt', removalPolicy: RemovalPolicy.RETAIN,
    pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
  });
  const handler = new NodejsFunction(stack, 'SavePaymentReference', {
    entry: fileURLToPath(new URL('./handler.js', import.meta.url)), handler: 'handler',
    runtime: Runtime.NODEJS_22_X, timeout: Duration.seconds(15), memorySize: 256,
    bundling: { externalModules: [] }, environment: { PAYMENT_TABLE: table.tableName },
  });
  table.grantReadWriteData(handler);
  const origins = [...new Set((process.env.AUTH_REDIRECT_URLS || 'http://localhost:8000/,http://localhost:3000/')
    .split(',').map(url => new URL(url.trim()).origin))];
  const api = new HttpApi(stack, 'PaymentReferenceApi', { corsPreflight: {
    allowOrigins: origins, allowMethods: [CorsHttpMethod.POST], allowHeaders: ['Content-Type', 'Authorization'], maxAge: Duration.hours(1),
  } });
  const stage = api.defaultStage?.node.defaultChild as CfnStage;
  stage.defaultRouteSettings = { throttlingBurstLimit: 20, throttlingRateLimit: 10 };
  api.addRoutes({ path: '/payment-reference', methods: [HttpMethod.POST],
    integration: new HttpLambdaIntegration('PaymentReferenceIntegration', handler),
    authorizer: new HttpUserPoolAuthorizer('PaymentReferenceAuth', userPool, { userPoolClients: [userPoolClient] }),
  });
  return { endpoint: api.apiEndpoint };
}
