import * as cdk from "aws-cdk-lib";
import {
  aws_s3 as s3,
  aws_lambda as lambda,
  aws_apigateway as apigateway,
} from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { Construct } from "constructs";
import path = require("path");
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsCdk1Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    //This is Code for lambda handling function.
    const layer = new lambda.LayerVersion(this, "MyLayer-2", {
      code: lambda.Code.fromAsset(path.join(__dirname, "..", "aws-sdk.zip")),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      license: "Apache-2.0",
      description: "A layer to test the L2 construct",
    });
    const myRole = new iam.Role(this, "lambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });
    myRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );
    const fn = new lambda.Function(this, "My Function", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "..", "lambda")),
      layers: [layer],
    });
    //This is Code for apigateway creating
  }
}
