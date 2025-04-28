package com.example;

import io.restassured.RestAssured;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import java.io.FileWriter;
import java.io.IOException;

/**
 * Hello world!
 *
 */
public class GetAccessToken 
{
    private static final String AUTH_URL = "https://your-auth-server.com/token"; // Replace with your actual auth URL
    private static String USERNAME;
    private static String PASSWORD;

    public static void main( String[] args )
    {
        if (args.length < 2) {
            System.out.println("Please provide username and password as command line arguments");
            System.out.println("Usage: mvn exec:java -Dexec.args=\"username password\"");
            return;
        }

        USERNAME = args[0];
        PASSWORD = args[1];
        
        // Get single access token
        String accessToken = authenticate();
        
        if (accessToken != null) {
            try {
                // Clean the old file by creating a new one
                FileWriter writer = new FileWriter("tokens.txt", true); // false means overwrite the file
                
                // Write the single token
                writer.write(accessToken);
                
                writer.close();
                System.out.println("Successfully wrote access token to tokens.txt");
            } catch (IOException e) {
                System.out.println("An error occurred while writing to the file.");
                e.printStackTrace();
            }
        } else {
            System.out.println("Failed to get access token");
        }
    }

    private static String authenticate() {
        try {
            RequestSpecification request = RestAssured.given()
                .header("Content-Type", "application/x-www-form-urlencoded")
                .formParam("grant_type", "password")
                .formParam("username", USERNAME)
                .formParam("password", PASSWORD);

            Response response = request.post(AUTH_URL);
            
            if (response.getStatusCode() == 200) {
                return response.jsonPath().getString("access_token");
            } else {
                System.out.println("Authentication failed with status code: " + response.getStatusCode());
                return null;
            }
        } catch (Exception e) {
            System.out.println("Error during authentication: " + e.getMessage());
            return null;
        }
    }
}
