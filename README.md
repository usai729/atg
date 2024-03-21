# ATG Social Media API

Below are the available endpoints and their descriptions:

## User Endpoints

-   **Register:** `POST /api/register`
    -   Register a new user with email, username, and password.
-   **Login:** `POST /api/login`
    -   Log in with email/username and password.
-   **Forgot Password:** `POST /api/forgot-password`
    -   Request password reset email.
-   **Reset Password:** `POST /api/reset-password`
    -   Reset password with a new password.
-   **Follow User:** `PUT /api/follow`
    -   Follow another user.
-   **Get Following:** `GET /api/following/:id`
    -   Get list of users the specified user is following.
-   **Get Followers:** `GET /api/followers/:id`
    -   Get list of users following the specified user.

## Post Endpoints

-   **Create Post:** `POST /api/create/post`
    -   Create a new post.
-   **Edit Post:** `PUT /api/edit/post/:id`
    -   Edit own post.
-   **Like Post:** `PUT /api/like/post`
    -   Like/unlike a post.
-   **Delete Post:** `DELETE /api/del/post/:id`
    -   Delete own post.
-   **Get All Posts:** `GET /api/posts`
    -   Get all posts.
-   **Get Single Post:** `GET /api/posts/:id`
    -   Get a single post by ID.
-   **Create Comment:** `POST /api/create/comment`
    -   Add a comment to a post.
-   **Like Comment:** `PUT /api/like/comment`
    -   Like/unlike a comment.

---
