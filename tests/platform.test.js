import test from 'node:test';
import assert from 'node:assert/strict';
import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { addProfiles } from '../platform/dynamodb/resource.js';
import { getEnvironment } from '../platform/environment.js';

test('only dev and prod hosted environments are accepted', () => {
  assert.equal(getEnvironment('dev'), 'dev');
  assert.equal(getEnvironment('prod'), 'prod');
  for (const branch of ['qa', 'main', '', 'production']) {
    assert.throws(() => getEnvironment(branch), /Unsupported environment/);
  }
});

test('dev and prod profiles use separate stack-owned tables with retained data', () => {
  const tables = [];
  for (const environment of ['dev', 'prod']) {
    const stack = new Stack(new App(), `Profiles-${environment}`);
    const { table } = addProfiles(stack, environment);
    tables.push(table);
    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
    template.hasResource('AWS::DynamoDB::Table', {
      DeletionPolicy: 'Retain', UpdateReplacePolicy: 'Retain',
      Properties: {
        KeySchema: [{ AttributeName: 'uuid', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'uuid', AttributeType: 'S' }],
        BillingMode: 'PAY_PER_REQUEST',
        DeletionProtectionEnabled: environment === 'prod',
        PointInTimeRecoverySpecification: { PointInTimeRecoveryEnabled: true },
        SSESpecification: { SSEEnabled: true },
      },
    });
    const resource = Object.values(template.findResources('AWS::DynamoDB::Table'))[0];
    assert.equal(resource.Properties.TableName, `hayagreeva-${environment}`);
    assert.equal(resource.Properties.TimeToLiveSpecification, undefined, 'profiles must not expire');
    template.resourceCountIs('AWS::IAM::Policy', 0);
  }
  assert.notEqual(tables[0].tableArn, tables[1].tableArn);
});
