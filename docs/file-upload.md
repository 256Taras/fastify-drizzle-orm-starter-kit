# File Uploading
### Overview

This documentation provides an in-depth guide on how to handle file uploads, particularly user avatars, within our application.
The guide emphasizes best practices for validation, file storage, and cleanup operations.

User Avatar Upload Endpoint

When a user wishes to update their avatar, they can do so through the /avatar endpoint. Initially, uploaded files are stored in a temporary directory storage/temp.
Request Schema:

```js

const usersSchemas = {
  // ... other schemas ...

  changeAvatar: {
    security: [{ bearerTokenAuth: [] }],
    consumes: ["multipart/form-data"],
    body: Type.Object({
      avatar: createFileTypeSchema(["image/jpeg", "image/png"]),
    }),
    response: {
      200: Type.Object({
        success: Type.Boolean({
          description: "Indicates if the operation was successful."
        }),
        message: Type.String({
          description: "Provides additional information about the operation, especially useful for debugging or user feedback."
        })
      }),
      ...convertHttpErrorCollectionToAjvErrors(defaultHttpErrorCollection),
    },
  },
};

app.post("/avatar", {
  schema: usersSchemas.changeAvatar,
  preHandler: [app.auth([app.verifyJwt]), app.parseMultipartFields()],
  async handler(req) {
    // Some validation Logic
    if (!req.body.avatar) {
      await app.removeUploadIfExists(req.body.avatar.path);
      throw new BadRequestException("No avatar provided!");
    }

    // Custom Logic (e.g., update database with new avatar path)
    try {
      const newFilePath = await app.uploadToStorage(req.body.avatar, 'avatars');
      // Update user's profile in the database with newFilePath

    } catch (error) {
      await app.removeUploadIfExists(req.body.avatar.path);
      throw new Error("Failed to save the avatar!");
    }

    // Return success response
    return { success: true, message: "Avatar updated!" };
  },
});
```

Best Practices:

  -  Validation First: Before processing an uploaded file, ensure it meets all the criteria. This includes checking file types and sizes. Files that don't meet the criteria should be discarded using app.removeUploadIfExists.

  -  Permanent Storage: On successful validation, store the file in a permanent directory using app.uploadToStorage. Always ensure to handle potential errors that may arise during this operation.

  -  Cleanup Operations: Ensure the temporary directory (storage/temp) is routinely cleaned to avoid accumulation of unprocessed files.

  -  Feedback to Users: Always provide meaningful feedback to users, especially when there's a failure in the file upload process. This includes validation failures and server-side issues.

Additional Notes:

  -  Dynamic Schema Creation: Use fileFactorySchema to generate schemas dynamically, accommodating various file types as needed. This ensures flexibility and maintainability.

  -  Temporary Storage Management: Periodically, especially during low-traffic times, clear out stale or old files from storage/temp.

  -  Consistent Error Handling: Adopt a consistent approach for error handling. This not only provides clarity to users but also aids developers in troubleshooting issues.