const errorHandler = (err, req, res, next) => {
    console.error(err);

    res.status(err.status || 500).json({
        succuss: false,
        message: err.message || "Internal Server Error"
    })
}

module.exports = errorHandler;