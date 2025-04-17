const requestNotFound = () => ({
    errors: [
        {
            code: 404,
            title: "Not Found",
            detail: "Requested resource not found",
        },
    ],
    code: 404,
});

export default requestNotFound;
