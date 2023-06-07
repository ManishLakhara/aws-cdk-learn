import * as cdk from "aws-cdk-lib";
import { aws_s3 as s3, aws_lambda as lambda } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import * as apigatewayv2 from "@aws-cdk/aws-apigatewayv2-alpha";
import { Construct } from "constructs";
import path = require("path");
import { WebSocketLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
export class AwsCdk1Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    //This is Code for lambda handling function.
    const layer = new lambda.LayerVersion(this, "aws-sdk", {
      code: lambda.Code.fromAsset(path.join("aws-sdk.zip")),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      layerVersionName: "aws-sdk",
    });
    const myRole = new iam.Role(this, "lambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });
    myRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );
    myRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AmazonSageMakerServiceCatalogProductsApiGatewayServiceRolePolicy"
      )
    );
    const fn = new lambda.Function(this, "My Function", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join("lambda")),
      layers: [layer],
      role: myRole,
    });
    //this will create apigateway
    const webSocketApi = new apigatewayv2.WebSocketApi(this, "mywsapi");
    const stage = new apigatewayv2.WebSocketStage(this, "mystage", {
      webSocketApi,
      stageName: "dev",
      autoDeploy: true,
    });
    const integration = new WebSocketLambdaIntegration("Integration", fn);
    webSocketApi.addRoute("sendmessage", {
      integration: new WebSocketLambdaIntegration("SendMessageIntegration", fn),
      returnResponse: true,
    });
    fn.addEnvironment("WEBSOCKET_URL", stage.url);
    new cdk.CfnOutput(this, "WebSocketDevStage", {
      value: stage.url,
    });
  }
}
