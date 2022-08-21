const express = require("express");

const router = express.Router();

// ========== Util Function ==========

String.prototype.format = function () {
  a = this;
  for (k in arguments) {
    a = a.replace(`{${k}}`, arguments[k]);
  }
  return a;
};

const switchPosition = (value) => {
  const out = [];

  for (const val of value) {
    const newValue = value.replace(val, "");
    if (newValue.length > 1) {
      for (const str of switchPosition(newValue)) {
        out.push(`${val}${str}`);
      }
    } else {
      out.push(`${val}${newValue}`);
    }
  }

  return out;
};

const validateInput = (params) => {
  return /^[0-9]{4}$/.test(params);
};

// ========== Service ==========

router.get("/", async (req, res) => {
  const params = req.query.value;

  if (validateInput(params)) {
    const listParam = switchPosition(params);
    let countSolution = 0;
    let output = null;
    loop1: for (const values of listParam) {
      const marks = ["+", "-", "*", "/"];
      for (const mark1 of marks) {
        for (const mark2 of marks) {
          for (const mark3 of marks) {
            const listSolution = [
              `{0}${mark1}{1}${mark2}{2}${mark3}{3}`, // 1234
              `({0}${mark1}{1})${mark2}{2}${mark3}{3}`, // (12)34
              `{0}${mark1}({1}${mark2}{2})${mark3}{3}`, // 1(23)4
              `{0}${mark1}{1}${mark2}({2}${mark3}{3})`, // 12(34)
              `({0}${mark1}{1}${mark2}{2})${mark3}{3}`, // (123)4
              `{0}${mark1}({1}${mark2}{2}${mark3}{3})`, // 1(234)
              `({0}${mark1}{1})${mark2}({2}${mark3}{3})`, // (12)(34)
              `(({0}${mark1}{1})${mark2}{2})${mark3}{3}`, // ((12)3)4
              `({0}${mark1}({1}${mark2}{2}))${mark3}{3}`, // (1(23))4
              `{0}${mark1}(({1}${mark2}{2})${mark3}{3})`, // 1((23)4)
              `{0}${mark1}({1}${mark2}({2}${mark3}{3}))`, // 1(2(34))
            ];
            for (const solution of listSolution) {
              const solutionFormat = solution.format(
                values[0],
                values[1],
                values[2],
                values[3]
              );
              const answer = eval(solutionFormat);
              countSolution++;
              if (answer == 24) {
                output = {
                  result: "YES",
                  solution: solutionFormat,
                  useSolution: countSolution,
                };
                break loop1;
              }
            }
          }
        }
      }
    }

    if (output == null) {
      output = { result: "NO" };
    }
    res.json(output);
  } else {
    res.status(400).json("Invalid parameter");
  }
});

module.exports = router;
