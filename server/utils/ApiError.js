class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }

  static BadRequest(message, errors) {
    return new ApiError(400, message)
  }
}

module.exports = ApiError
