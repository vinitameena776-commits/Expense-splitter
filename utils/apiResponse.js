const sendResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: statusCode < 400,
    message
  };
  if (data) response.data = data;
  res.status(statusCode).json(response);
};

module.exports = sendResponse;