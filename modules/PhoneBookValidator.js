
const phoneNumberValidator = (phoneNumber) => {
  const regex = /^\d+-\d+$/;
  if (!regex.test(phoneNumber)) {
    return false;
  }
  const [part1, part2] = phoneNumber.split("-");
  return part1.length >= 2 && part1.length <= 3 && part2.length >= 8;
};

module.exports = {
  phoneNumberValidator,
};
