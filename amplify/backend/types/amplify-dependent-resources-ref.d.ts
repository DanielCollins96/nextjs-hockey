export type AmplifyDependentResourcesAttributes = {
    "auth": {
        "three": {
            "IdentityPoolId": "string",
            "IdentityPoolName": "string",
            "UserPoolId": "string",
            "UserPoolArn": "string",
            "UserPoolName": "string",
            "AppClientIDWeb": "string",
            "AppClientID": "string",
            "CreatedSNSRole": "string"
        },
        "userPoolGroups": {
            "fb2GroupRole": "string"
        }
    },
    "api": {
        "three": {
            "GraphQLAPIIdOutput": "string",
            "GraphQLAPIEndpointOutput": "string"
        }
    },
    "storage": {
        "nhljsstorage": {
            "BucketName": "string",
            "Region": "string"
        }
    }
}