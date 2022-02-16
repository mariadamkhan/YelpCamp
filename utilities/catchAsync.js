module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
        }
    }

    // a higher-order function, that is, a function that accepts a function as an argument, 
// and it also returns a function. wrapAsync will accept a function as a parameter, 
// and its objective is to check if there are any errors in that function. 
// If there aren't, it will return the same function that was passed as an argument,
//  and the code will be run normally, but if there's an error, it will catch the error, 
// calling next() on it so it can be handled. It's a cleaner way to handle errors; by using it,
//  you won't need to write try/catch blocks on each function; just pass the function 
// to this wrapAsync function instead, and it will automatically just return the function 
// if everything is fine, or return the error.
