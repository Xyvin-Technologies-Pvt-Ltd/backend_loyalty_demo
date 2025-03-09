const response_handler = require("../helpers/response_handler");
const Customer = require("../models/customer_model");

exports.generate_referral_code = async (name) => {
  if (!name) return response_handler(res, 400, "Name is required.");

  const to_snake_case = (str) =>
    str
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

  let base_code = to_snake_case(name);
  let referral_code = base_code;
  let counter = 1;

  while (await Customer.exists({ referral_code: referral_code })) {
    referral_code = `${base_code}_${counter}`;
    counter++;
  }

  return referral_code;
};
