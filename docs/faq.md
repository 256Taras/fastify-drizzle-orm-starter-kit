# Frequently Asked questions

## All Questions

1. Is the use of JSDoc mandatory?

   - No, JSDoc is optional.
   - JSDoc is preferred for utils or any system staff,
     and any common related code that may be used/reused
     a lot.
   - No need to cover JSDoc some code that changes
     frequently and is understandable by its signature if
     it's not utils.

2. How is it recommended to start the project? Server and database in the docker or just run the database in the docker and the server locally?

   - Local development is better in 'infrastructure in docker & server locally' mode - server in docker will be slower to constantly rerun with changes
   - everything in docker is used only to always be able run it despite on ENV_CONFIG
   - server in docker is usually will be running on deploy & CI/CD

3. Can there be another module in the module?

    Yes, but please avoid it, 'cause it brings complexity and too much work.

    It's so-called 'boundaries' from DDD, but it should be avoided in non-huge applications

4. Operational Error VS Programmers Error:

- [View the differences of operational error and programmers error](https://www.joyent.com/node-js/production/design/errors)

  <strong>Brief explanation</strong>

  1. Errors divides into: operational error and programmers
  2. <strong>Operational error</strong>
     represent run-time problems experienced by correctly-written programs. These are not bugs in the program. In fact, these are usually problems with something else: the system itself (e.g., out of memory or too many open files), the system’s configuration (e.g., no route to a remote host), the network (e.g., socket hang-up), or a remote service (e.g., a 500 error, failure to connect, or the like). Examples include:
     - failed to connect to server
     - failed to resolve hostname
     - invalid user input
     - request timeout
     - server returned a 500 response
     - socket hang-up
     - system is out of memory
  3. <strong>Programmer errors</strong> are bugs in the program. These are things that can always be avoided by changing the code. They can never be handled properly (since by definition the code in question is broken).
     - tried to read property of “undefined”
     - called an asynchronous function without a callback
     - passed a “string” where an object was expected
     - passed an object where an IP address string was - expected

5. What is exceptions?

    Exceptions are a type of error that is expected or known to occur.

    Examples:

    - User might try to register when he is already registered - return UserAlreadyExistsException
    - File is not found
    - User is not found

    <strong>Another explanation from the internet</strong>:
    Exception - that might be generally those from which a program can recover & it might be a good idea to recover from such exceptions programmatically. Examples include FileNotFoundException, ParseException, UserAlreadyExists, UserNotFound. A programmer is expected to check for these exceptions by using the try-catch block or throw it back to the caller.

