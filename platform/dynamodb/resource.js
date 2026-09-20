import { RemovalPolicy, Tags } from 'aws-cdk-lib';
import { Table, AttributeType, BillingMode, TableEncryption } from 'aws-cdk-lib/aws-dynamodb';
import { getEnvironment } from '../environment.js';

export function addProfiles(stack, environment = getEnvironment()) {
  getEnvironment(environment);
  const table = new Table(stack, 'Profiles', {
    tableName: `hayagreeva-${environment}`,
    partitionKey: { name: 'uuid', type: AttributeType.STRING },
    billingMode: BillingMode.PAY_PER_REQUEST,
    encryption: TableEncryption.AWS_MANAGED,
    pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: false },
    deletionProtection: environment === 'prod',
    removalPolicy: RemovalPolicy.RETAIN,
  });
  Tags.of(table).add('Environment', environment);
  Tags.of(table).add('Application', 'hayagreevayoga');
  return { table };
}
