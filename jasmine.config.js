export default {
  spec_dir: "test",
  spec_files: [
    "**/*.test.js",
  ],
  helpers: [
    "helpers/**/*.js",
  ],
  env: {
    stopSpecOnExpectationFailure: false,
    random: true,
    forbidDuplicateNames: true,
  },
};
