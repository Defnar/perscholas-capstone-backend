# About this
- this backend is intended as a service to allow for user collaboration on projects.
- Users may create their own projects, make them private or publicly viewable.
- users may attach tasks to their projects.
- allows for user signup using username, email, password, or through github oauth.

# installation
- download the files and run `npm i` in your root file to install all dependencies.
- Dependencies: bcrypt, cookie-parser, cors, dotenv, express, jsonwebtoken, mongoose, passport, passport-github2

##Env files
- set up your env files with these variables.  the github url should follow the following syntax: <your address, IE: http://localhost><port></api/users/auth/github/callback on the backend, or call this api on the frontend>

~~~
MONGO_URI=
JWT_SECRET=
REFRESHTTL=
TOKENTTL=
NODE_ENV="development" OR "production"
PORT=8000

#github
GITHUB_CLIENT_ID=
GITHUB_CALLBACK_URL=http://localhost:8000/api/users/auth/github/callback
GITHUB_CLIENT_SECRET=
~~~

## User Routes
### Register
- POST `/api/users/register`
- If not using github oauth, users will need to supply a username, email, and password to register for the service.

### Login
- POST `/api/users/login`
- login is handled via email and password comparison.

### update user
- PUT `/api/users/`
- allows for users to update their username.  Will return an error message if entered username or email are already in the database.

### Delete user
- DELETE `/api/users`
- allows for deleting a user from the database

### Log out
- POST `/api/users/logout`
- logs a user out, moving their refresh token and access token to a map on the backend

## Auth routes
### github authentication
- GET `/api/users/auth/github`
- directs user to github for authentication and login

### github callback authentication
- GET `/api/users/auth/github/callback`
- server-side callback of the authentication process.

## Find a user
- GET `api/users/`
- returns an array of users using input as a regex
- returns _id, username, email, and message list

## Project Routes
### public projects
- GET `/api/projects`
- grabs public projects for frontpage view.
- results are queryable, and come with pagination options

| query | value        |
|:-----:|:------------:|
| title | project name |
| owner | project owner |
|sortBy| field to sort by |
|sortOrder| 1 for ascending, -1 for descending|
|pageSize| number of items to display |
|page| number of page to be shown|

### private projects
- GET `/api/projects/private`
- grabs a list of projects the user has created or is collaborating in
- results are queryable, see chart above.  Owner is not queryable for this one.

### Create a project
- POST `/api/projects/`
- allows user to create a project.  See chart below for options on creation and how it works under the scenes

| key | description | required? | default |
|:-:|:-:|:-:|:-:|
|owner | owner of project| yes | creator of the project|
|user | array of users with access, see edit collaborators for more information | no | creator of the project|
|title| name of project | yes | |
|tasks| array of task database Ids | no | [] |
|deadline| allows user to set deadline | no | |
|private| sets project to private or public view | yes | true |
|status | sets status of project, see chart below | yes | To Do |
|joinRequest| allows for other users to request to join project, this is an array of those requests | no | [] |


  |status|
  |:-:|
  |To Do|
  |In Progress|
  |Done|
  |Overdue|
  |Archive|

### project collaborators
- PUT `/api/projects/projectId/collaborators`
- Allows a user to edit collaborators, their permissions, and who is and is not a collaborator.
- projects should have a user array attached to them.  Frontend should look to return a modified array based on this, using the chart below
- to get access to _id of a user, use the find user function defined in user routes.

|key|description|required|default|
|:-:|:-:|:-:|:-:|
|user|database id of user| yes | |
|role| "owner" or "collaborator" | yes | collaborator |
|permissions| see list of permissions below | yes | |

### Permissions

|perm| description|
|:-:|:-:|
|getProject| allows a collaborator to view the project.  This must be set for other operations |
|editProject| allows a user to edit details on a project |
|deleteProject|allows a user to delete a project|
|addTask| allows a user to add tasks to a project|
|deleteTask| allows a user to delete a task|
|archiveTask| allows a user to archive a task|


### get a project
- GET `/api/projects/projectId`
- Allows a user to view a single project, tasks, and collaborators. Requires getProject rights for this.
- returns populated fields for tasks and their creators.

### edit a project
- PUT `api/projects/projectId`
- allows a user to edit a project.  This does not permit user to edit users, that is handled in collaborators route.  refer to chart for project creation for options


### Delete a project
- DELETE `/api/projects/projectId/`
- deletes a project and associated tasks from the database


## Task Routes
### Add Task
- POST `/api/projects/projectId/tasks/`
- allows a user to add task.  See chart below for options

|key|description|required|default|
|:-:|:-:|:-:|:-:|
|title| title of the project| yes| |
|description| description of the project| no ||
|status| set the status of the task, options same as project status| yes | To Do|
|deadline| when task is due to complete| no||

### Get Task
- GET `/api/projects/projectId/tasks/taskId`
- Allows a user to get a task.  Requires getProject permission

### Edit task
- PUT `/api/projects/projectId/tasks/taskId`
- Allows a user to edit a task.  Requires archiveTask permission to archive a task

### Delete task
- DELETE `/api/projects/projectId/tasks/taskId`
- allows a user to delete a task

## Notes
- the middleware is intended to take a mongoose model's name, lower case it, and attach Id to it for parameter identification.  Any new featuers should bear this structure in mind.
- middleware attaches database items to req in the form of req[modelName], where model Name is the lower case of the mongoose model.  Project is project for example.  the intention is to have a modular design where we can just take a parent model key and compare it to what's saved in document for verification.  With the parameters of contentMiddleware(<model we're working with, ie: Task>, <model name of parent model, ie: project>, <permission key such as "getProject">, if we run contentMiddleware(Task, "project", "addTask"), we would run findById on the database using the taskId parameter, and compare the project ref in that object to the projectId.  If they match, we then check user.permissions to see if the perm key is in the permissions array.  If it is, task is attached to req.task.
- this middleware is designed to take arrays and single ids for testing.
- with the function of the middleware, any sets of users for access to a model should be nested as: user: {user:..., permissions:....}.  By keeping similar structure to projects and tasks, we allow for modularity and functionality with the general content middleware function
