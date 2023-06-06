import AWS from "aws-sdk";
const apiGateway = new AWS.ApiGatewayManagementApi({
  endpoint: "l",
  apiVersion: "2018-11-29",
  region: "us-east-1",
});
export const handler = async (event) => {
  // TODO implement
  console.log(AWS.VERSION);
  const { requestContext, body } = event;
  const connectionId = requestContext.connectionId;
  const routeKey = requestContext.routeKey;

  if (routeKey === "$connect") {
    // Handle new connection
    console.log(`New connection: ${connectionId}`);
  } else if (routeKey === "$disconnect") {
    // Handle disconnection
    console.log(`Disconnected: ${connectionId}`);
  } else if (routeKey === "sendMessage") {
    // Handle incoming messages
    console.log(`Received message from ${connectionId}: ${body}`);

    await apiGateway
      .postToConnection({
        ConnectionId: connectionId,
        Data: `Hello from lambda`,
      })
      .promise();
  }
  const response = {
    statusCode: 200,
    body: JSON.stringify("Hello from Lambda!"),
  };
  return response;
};
